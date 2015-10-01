/*!
 * angular-textarea-autosize v1.2.0
 * (c) 2015 Ken Snyder
 * MIT License
 *
 * Based on the following code and documentation:
 * https://github.com/jackmoore/autosize
 * https://github.com/javierjulio/textarea-autosize
 * https://github.com/AndrewDryga/jQuery.Textarea.Autoresize
 * https://developer.mozilla.org/en-US/docs/Web/API/Element.scrollHeight
 */
(function (angular) {

  angular.module('stickyApp.directives')
    .value('constructor', AutosizedTextarea)
    .directive('autosize', ['$timeout', '$window', 'constructor',
      function autosizeDirective($timeout, $window, constructor) {
        /*
         Usage:
         <!-- min rows of 1 -->
         <textarea ng-model="note" autosize></textarea>
         <!-- min rows of 2 -->
         <textarea ng-model="note" autosize rows="2"></textarea>
         <!-- min rows of 3, callback when size changes -->
         <textarea ng-model="note" autosize="{minRows:3, onresize:myHandler}"></textarea>
         */
        return {
          restrict: 'A',
          scope: {
            options: '=?autosize'
          },
          require: '?ngModel',
          link: function autosizeDirectiveLink($scope, $textarea, attrs, ngModel) {
            $scope.options = $scope.options || {};
            var sizer = new constructor({
              $scope: $scope,
              $textarea: $textarea,
              attrs: attrs,
              $window: $window,
              ngModel: ngModel
            });
            $timeout(function () {
              sizer.setup();
              sizer.observe();
              sizer.adjust();
            });
            // The autosizer will not respond to changes in the rows attribute
            // or the computed css values for border, padding, box-sizing or line-height
            // so we add sort of hack to reinit manually if needed.
            // Those changes could be auto detected with a MutationObserver
            // but that is outside the scope of this project right now.
            $textarea[0].reinitAutosizer = function () {
              sizer.setup();
              sizer.adjust();
            };
          }
        };
      }]);

  function debounce(ms, fn) {
    var handle;
    return function () {
      clearTimeout(handle);
      handle = setTimeout(fn, ms);
    };
  }

  function AutosizedTextarea() {
    this.initialize.apply(this, [].slice.call(arguments));
  }

  AutosizedTextarea.prototype = {
    initialize: function (vars) {
      this.$scope = vars.$scope;
      this.$window = vars.$window;
      this.$textarea = vars.$textarea;
      this.ngModel = vars.ngModel;
      this.attrs = vars.attrs;
      this.textarea = this.$textarea[0];
    },
    setup: function () {
      // just in case we are splitting pixels,
      // we would rather see descending letters get cut off
      // than have the scrollbar display and mess up our calculations
      this.$textarea.css({
        overflow: 'hidden',
        resize: 'none'
      });
      // get effective property values
      var style = this.$window.getComputedStyle(this.textarea, null);
      // note that css values can be fractional
      var lineHeight = style.getPropertyValue('line-height');
      if (lineHeight == 'normal') {
        lineHeight = (parseFloat(style.getPropertyValue('font-size')) || 16) * 1.14;
      }
      else {
        lineHeight = parseFloat(lineHeight);
      }
      this.lineHeight = lineHeight;
      this.calculatedPadding =
        parseFloat(style.getPropertyValue('padding-top') || 0)
        + parseFloat(style.getPropertyValue('padding-bottom') || 0)
      ;
      this.isBorderBox = (
        style.getPropertyValue('box-sizing') == 'border-box' ||
        style.getPropertyValue('-webkit-box-sizing') == 'border-box' ||
        style.getPropertyValue('-moz-box-sizing') == 'border-box'
      );
      this.verticalPadding = (this.isBorderBox ? 0 : Math.ceil(this.calculatedPadding));
      this.minHeight = Math.ceil((this.$scope.options.minRows || parseFloat(this.attrs.rows) || 1) * this.lineHeight + (this.isBorderBox ? this.calculatedPadding : 0));
    },
    observe: function () {
      var events = 'input';
      if ('onpropertychange' in this.textarea) {
        // Detects IE9. IE9 does not fire oninput for deletions,
        // so binding to onkeyup to catch most of those occasions.
        events += ' keyup';
      }
      // Listen for both keyboard events and view changes
      // but use debounce to avoid calling both in the same event loop.
      var self = this;
      var adjust = debounce(0, function () {
        self.adjust();
      });
      this.$textarea.on(events, adjust);
      if (this.ngModel) {
        this.ngModel.$viewChangeListeners.push(adjust);
      }
    },
    adjust: function () {
      // if we have an onresize callback, we need to note the "before" height
      if (this.$scope.options.onresize) {
        var oldHeight = this.textarea.style.height;
      }
      var currentWindowScroll = this.$window.scrollY;
      // ensure that content can't fit so scrollHeight will be correct
      this.textarea.style.height = '0';
      // set height that is just tall enough
      // note that scrollHeight is always an integer
      var newHeight = Math.max(this.minHeight, this.textarea.scrollHeight - this.verticalPadding);
      this.textarea.style.height = newHeight + 'px';
      // put the window scroll position back
      // since setting height to 0 may cause window scroll to change
      if (currentWindowScroll != this.$window.scrollY) {
        this.$window.scroll(this.$window.scrollX, currentWindowScroll);
      }
      // trigger resize callback if height has changed
      if (this.$scope.options.onresize && oldHeight != newHeight) {
        this.$scope.options.onresize.call(this, parseFloat(oldHeight), newHeight);
      }
    }
  };

})(angular);
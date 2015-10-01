
angular.module('stickyApp.controllers', []);
angular.module('stickyApp.factories', []);

angular.module('stickyApp.directives.controllers', [
  'stickyApp.factories'
]);

angular.module('stickyApp.directives', [
  'stickyApp.directives.controllers'
]);

function SocketConnectorFactory($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
}

SocketConnectorFactory.$inject = ['$rootScope'];

angular.module('stickyApp.factories')
  .factory('socketConnector', SocketConnectorFactory);

// https://github.com/Reklino/angular-resizable

angular.module('stickyApp.directives')
  .directive('resizable', function() {
    var toCall;
    function throttle(fun) {
      if (toCall === undefined) {
        toCall = fun;
        setTimeout(function() {
          toCall();
          toCall = undefined;
        }, 100);
      } else {
        toCall = fun;
      }
    }
    return {
      restrict: 'AE',
      scope: {
        rDirections: '=',
        rCenteredX: '=',
        rCenteredY: '=',
        rWidth: '=',
        rHeight: '=',
        rFlex: '=',
        rGrabber: '@',
        rDisabled: '@'
      },
      link: function(scope, element, attr) {
        var flexBasis = 'flexBasis' in document.documentElement.style ? 'flexBasis' :
          'webkitFlexBasis' in document.documentElement.style ? 'webkitFlexBasis' :
            'msFlexPreferredSize' in document.documentElement.style ? 'msFlexPreferredSize' : 'flexBasis';

        // register watchers on width and height attributes if they are set
        scope.$watch('rWidth', function(value){
          element[0].style.width = scope.rWidth + 'px';
        });
        scope.$watch('rHeight', function(value){
          element[0].style.height = scope.rHeight + 'px';
        });

        element.addClass('resizable');

        var style = window.getComputedStyle(element[0], null),
          w,
          h,
          dir = scope.rDirections,
          vx = scope.rCenteredX ? 2 : 1, // if centered double velocity
          vy = scope.rCenteredY ? 2 : 1, // if centered double velocity
          inner = scope.rGrabber ? scope.rGrabber : '<span></span>',
          start,
          dragDir,
          axis,
          info = {};

        var updateInfo = function(e) {
          info.width = false; info.height = false;
          if(axis === 'x')
            info.width = parseInt(element[0].style[scope.rFlex ? flexBasis : 'width']);
          else
            info.height = parseInt(element[0].style[scope.rFlex ? flexBasis : 'height']);
          info.id = element[0].id;
          info.evt = e;
        };

        var dragging = function(e) {
          var prop, offset = axis === 'x' ? start - e.clientX : start - e.clientY;
          switch(dragDir) {
            case 'top':
              prop = scope.rFlex ? flexBasis : 'height';
              element[0].style[prop] = h + (offset * vy) + 'px';
              break;
            case 'bottom':
              prop = scope.rFlex ? flexBasis : 'height';
              element[0].style[prop] = h - (offset * vy) + 'px';
              break;
            case 'right':
              prop = scope.rFlex ? flexBasis : 'width';
              element[0].style[prop] = w - (offset * vx) + 'px';
              break;
            case 'left':
              prop = scope.rFlex ? flexBasis : 'width';
              element[0].style[prop] = w + (offset * vx) + 'px';
              break;
          }
          updateInfo(e);
          throttle(function() { scope.$emit('angular-resizable.resizing', info);});
        };
        var dragEnd = function(e) {
          updateInfo();
          scope.$emit('angular-resizable.resizeEnd', info);
          scope.$apply();
          document.removeEventListener('mouseup', dragEnd, false);
          document.removeEventListener('mousemove', dragging, false);
          element.removeClass('no-transition');
        };
        var dragStart = function(e, direction) {
          dragDir = direction;
          axis = dragDir === 'left' || dragDir === 'right' ? 'x' : 'y';
          start = axis === 'x' ? e.clientX : e.clientY;
          w = parseInt(style.getPropertyValue('width'));
          h = parseInt(style.getPropertyValue('height'));

          //prevent transition while dragging
          element.addClass('no-transition');

          document.addEventListener('mouseup', dragEnd, false);
          document.addEventListener('mousemove', dragging, false);

          // Disable highlighting while dragging
          if(e.stopPropagation) e.stopPropagation();
          if(e.preventDefault) e.preventDefault();
          e.cancelBubble = true;
          e.returnValue = false;

          updateInfo(e);
          scope.$emit('angular-resizable.resizeStart', info);
          scope.$apply();
        };

        dir.forEach(function (direction) {
          var grabber = document.createElement('div');

          // add class for styling purposes
          grabber.setAttribute('class', 'rg-' + direction);
          grabber.innerHTML = inner;
          element[0].appendChild(grabber);
          grabber.ondragstart = function() { return false; };
          grabber.addEventListener('mousedown', function(e) {
            var disabled = (scope.rDisabled === 'true');
            if (!disabled && e.which === 1) {
              // left mouse click
              dragStart(e, direction);
            }
          }, false);
        });
      }
    };
  });
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
function StickyNoteDirective() {
  return {
    restrict: 'A',
    controller: 'StickyNoteCtrl'
  };
}

angular.module('stickyApp.directives')
  .directive('stickyNote', StickyNoteDirective);
function MainCtrl($scope, $stateParams, $state, socketConnector) {
  var self = this;

  this.$scope = $scope;
  this.$stateParams = $stateParams;
  this.$state = $state;
  this.socketConnector = socketConnector;
  this.$scope.notes = {};
  $scope.$on('$stateChangeSuccess', function () {
    self.checkBoard();
  });

  $scope.styles = {
    background: "url(/images/bg_corkboard.jpg) top left repeat fixed"
  };

  // Incoming
  this.initSocket();

  // Outgoing
  this.$scope.createNote = function () {
    self.createNote()
  };

  this.$scope.deleteNote = function (data) {
    self.deleteNote(data)
  };
}

MainCtrl.prototype.initSocket = function () {
  var self = this;
  this.socketConnector.on('onNoteCreated', function (data) {
    self.$scope.notes[data.id] = data;
  });

  this.socketConnector.on('onNoteDeleted', function (data) {
    if (self.$scope.notes.hasOwnProperty(data.id)) {
      delete self.$scope.notes[data.id];
    }
  });

  this.socketConnector.on('onCurrentNotes', function (data) {
    data.forEach(function(note){
      self.$scope.notes[note.id] = note;
    });
  });
};

MainCtrl.prototype.createNote = function () {
  this.socketConnector.emit('createNote');
};

MainCtrl.prototype.deleteNote = function (id) {
  delete this.$scope.notes[id];
  this.socketConnector.emit('deleteNote', {id: id});
};

MainCtrl.prototype.checkBoard = function () {
  if (this.$stateParams.boardId) {
    this.board = this.$stateParams.boardId;
    this.socketConnector.emit('getNotesFromBoard', {board: this.board});
  } else {
    this.board = new Date().getTime();
    this.$state.transitionTo("board", {boardId: this.board})
  }
};


MainCtrl.$inject = ['$scope', '$stateParams', '$state', 'socketConnector'];

angular.module('stickyApp.controllers')
  .controller('MainCtrl', MainCtrl);
function StickyNoteCtrl($scope, $element, socketConnector) {
  var self = this;

  this.scope = $scope;
  this.note = $scope.note;
  this.element = $element;
  this.socket = socketConnector;

  this.scope.$on('angular-resizable.resizeEnd', function(event, info){
    console.log(info);
  });

  this.setDraggable();

  this.socket.on('onNoteMoved', function (data) {
    self.onNoteMoved(data);
  });

  this.socket.on('onNoteUpdated', function (data) {
    self.onNoteUpdated(data);
  });

  // Outgoing
  this.scope.updateNote = function () {
    self.updateNote();
  };

  // Some DOM initiation to make it nice
  this.element.css('left', '10px');
  this.element.css('top', '50px');
  this.element.hide().fadeIn(400, function () {
    self.animate();
  });
}

StickyNoteCtrl.prototype.animate = function () {
  if (this.note.position) {
    this.element.animate(this.note.position);
  }
};

StickyNoteCtrl.prototype.setDraggable = function () {
  var self = this;
  this.element.draggable({
    stop: function (event, ui) {
      self.note.position = {left: ui.position.left, top: ui.position.top};

      self.socket.emit('moveNote', {
        id: self.note.id,
        position: self.note.position
      });
    }
  });
};

StickyNoteCtrl.prototype.onNoteMoved = function (data) {
  if (data.id == this.note.id) {
    this.note.position = data.position;
    this.animate()
  }
};

StickyNoteCtrl.prototype.onNoteUpdated = function (data) {
  if (data.id == this.note.id) {
    this.note.title = data.title;
    this.note.body = data.body;
  }
};

StickyNoteCtrl.prototype.updateNote = function () {
  this.socket.emit('updateNote', {
    id: this.note.id,
    title: this.note.title,
    body: this.note.body
  });
};

StickyNoteCtrl.$inject = ['$scope', '$element', 'socketConnector'];

angular.module('stickyApp.directives.controllers', ['stickyApp.factories'])
  .controller('StickyNoteCtrl', StickyNoteCtrl);
function Config($stateProvider, $urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });
  $urlRouterProvider.otherwise('/');
  $stateProvider.state('home', {
    url: '/'
  }).state('board', {
    url: "/board/:boardId"
  });
}

Config.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];

var app = angular.module('stickyApp', [
  'ui.router',
  'stickyApp.factories',
  'stickyApp.controllers',
  'stickyApp.directives'
]);

app.config(Config);

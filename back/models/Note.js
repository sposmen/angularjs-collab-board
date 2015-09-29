var thinky = require('thinky')();
var type = thinky.type;

var Note = thinky.createModel("Notes", {
  id:  type.number().integer(),
  title: type.string(),
  body: type.string(),
  position:type.object().optional(),
  board: type.number().integer()
});


module.exports = Note;
var _               = require('underscore');
var createMessage = require('./createMessage');

var exports = module.exports = function createMessageSequence() {
  return new AtMessageSequence();
};

exports = AtMessageSequence;
function AtMessageSequence() {
  this.number = 0;
}

AtMessageSequence.prototype.next = function(commands) {
  return createMessage(commands, this.number++);
};

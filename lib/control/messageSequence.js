var _ = require('underscore');
var message = require('./message');

var exports = module.exports = function messageSequence() {
  return new AtMessageSequence();
};

exports = AtMessageSequence;
function AtMessageSequence() {
  this.number = 0;
}

AtMessageSequence.prototype.next = function(commands) {
  return message(commands, this.number++);
};

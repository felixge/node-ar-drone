var _ = require('underscore');
var message = require('./message');

var exports = module.exports = function messageSequence() {
  return new MessageSequence();
};

exports = MessageSequence;
function MessageSequence() {
  this.number = 0;
}

MessageSequence.prototype.next = function(commands) {
  return message(commands, this.number++);
};

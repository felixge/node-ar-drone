var _ = require('underscore');

module.exports = function message(options) {
  options = options || {};

  return new Message(options);
};

module.exports.Message = Message;
function Message(options) {
  this.commands = options.commands || [];
  // this is just for our internal tracking, not part of the drone protocol
  this.sequenceNumber = options.sequenceNumber;
}

Message.prototype.toString = function() {
  return this.commands.reduce(function(string, command) {
    return string + command;
  }, '');
};

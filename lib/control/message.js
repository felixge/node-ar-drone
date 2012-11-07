var _ = require('underscore');

module.exports = function message(commands, number) {
  commands = (commands || []).map(function(command) {
    return _.clone(command);
  });

  return new Message(commands, number);
};

module.exports.Message = Message;
function Message(commands, number) {
  this.commands = commands;

  // this is just for our internal tracking, not part of the drone protocol
  this.number = number;
}

Message.prototype.toString = function() {
  return this.commands.reduce(function(string, command) {
    return string + command;
  }, '');
};

var _ = require('underscore');

module.exports = function createAtMessage(commands, number) {
  commands = (commands || []).map(function(command) {
    return _.clone(command);
  });

  return new AtMessage(commands, number);
};

module.exports.AtMessage = AtMessage;
function AtMessage(commands, number) {
  this.commands = commands;

  // this is just for our internal tracking, not part of the drone protocol
  this.number = number;
}

AtMessage.prototype.toString = function() {
  return this.commands.reduce(function(string, command) {
    return string + command;
  }, '');
};

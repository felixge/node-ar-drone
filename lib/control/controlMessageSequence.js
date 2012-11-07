var control           = require('../control');
var messageSequence = require('./messageSequence');
var commandSequence = require('./commandSequence');

module.exports = function controlMessageSequence(options) {
  options                 = options || {};
  options.messageSequence = options.messageSequence || messageSequence();
  options.commandSequence = options.commandSequence || commandSequence();
  return new ControlMessageSequence(options);
};

module.exports.ControlMessageSequence = ControlMessageSequence;
function ControlMessageSequence(options) {
  this.messageSequence = options.messageSequence;
  this.commandSequence = options.commandSequence;
}

ControlMessageSequence.prototype.next = function(control) {
  var commands = [
    this.commandSequence.ref(control),
    this.commandSequence.pcmd(control),
  ];

  return this.messageSequence.next(commands);
};

var createControl           = require('../createControl');
var createMessageSequence = require('./createMessageSequence');
var createCommandSequence = require('./createCommandSequence');

module.exports = function createControlMessageSequence(options) {
  options                 = options || {};
  options.messageSequence = options.messageSequence || createMessageSequence();
  options.commandSequence = options.commandSequence || createCommandSequence();
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

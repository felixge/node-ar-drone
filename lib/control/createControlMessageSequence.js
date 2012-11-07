var createControl           = require('../createControl');
var createAtMessageSequence = require('./createAtMessageSequence');
var createAtCommandSequence = require('./createAtCommandSequence');

module.exports = function createControlMessageSequence(options) {
  options                 = options || {};
  options.messageSequence = options.messageSequence || createAtMessageSequence();
  options.commandSequence = options.commandSequence || createAtCommandSequence();
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

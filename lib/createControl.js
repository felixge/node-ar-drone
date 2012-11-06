var createAtMessageSequence = require('./control/createAtMessageSequence');
var createAtCommandSequence = require('./control/createAtCommandSequence');

module.exports = function createControl(options) {
  options = options || {};

  options.messageSequence = options.messageSequence || createAtMessageSequence();
  options.commandSequence = options.commandSequence || createAtCommandSequence();

  return new Control(options);
};

module.exports.Control = Control;
function Control(options) {
  this.fly       = false;
  this.emergency = false;
  this.upDown    = 0;
  this.leftRight = 0;
  this.frontBack = 0;
  this.upDown    = 0;
  this.clockSpin = 0;

  this.messageSequence = options.messageSequence;
  this.commandSequence = options.commandSequence;
}

Control.prototype.nextMessage = function() {
  var commands = [
    this.commandSequence.ref(this),
    this.commandSequence.pcmd(this),
  ];

  return this.messageSequence.next(commands);
};

Control.prototype.toJSON = function() {
  var self = this;
  return Object.keys(this).reduce(function(json, key) {
    json[key] = self[key];
    return json
  }, {});
};

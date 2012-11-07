var createConfig                 = require('./createConfig');
var createControlMessageSequence = require('./control/createControlMessageSequence');
var createAtMessageUdpStream     = require('./control/createAtMessageUdpStream');

module.exports = function createControl(options) {
  options = options || {};

  options.config                 = options.config || createConfig();
  options.controlMessageSequence = options.controlMessageSequence || createControlMessageSequence();
  options.atMessageUdpStream     = options.atMessageUdpStream || createAtMessageUdpStream();

  var control = new Control(options);

  if (!options.paused) {
    control.resume();
  }

  return control;
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

  this.config                 = options.config;
  this.controlMessageSequence = options.controlMessageSequence;
  this.atMessageUdpStream     = options.atMessageUdpStream;

  this._interval = null;
}

Control.prototype.resume = function() {
  clearInterval(this._interval);
  this._interval = setInterval(
    this._sendNextMessage.bind(this),
    this.config.controlInterval
  );
};

Control.prototype._sendNextMessage = function() {
  this.atMessageUdpStream.write(this.controlMessageSequence.next());
};

Control.prototype.toJSON = function() {
  var self = this;
  return Object.keys(this).reduce(function(json, key) {
    json[key] = self[key];
    return json
  }, {});
};

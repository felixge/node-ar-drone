var config = require('./config');
var controlMessageSequence = require('./control/controlMessageSequence');
var udpMessageStream = require('./control/udpMessageStream');

module.exports = function control(options) {
  options = options || {};

  options.config = options.config || config();
  options.controlMessageSequence = options.controlMessageSequence || controlMessageSequence();
  options.atMessageUdpStream = options.atMessageUdpStream || udpMessageStream();

  var control = new Control(options);

  if (!options.paused) {
    control.resume();
  }

  return control;
};

module.exports.Control = Control;
function Control(options) {
  this.fly = false;
  this.emergency = false;
  this.upDown = 0;
  this.leftRight = 0;
  this.frontBack = 0;
  this.upDown = 0;
  this.clockSpin = 0;

  this.config = options.config;
  this.controlMessageSequence = options.controlMessageSequence;
  this.atMessageUdpStream = options.atMessageUdpStream;

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

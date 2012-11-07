var util = require('util');
var config = require('./config');
var controlMessageSequence = require('./control/controlMessageSequence');
var udpMessageStream = require('./control/udpMessageStream');

module.exports = function control(options) {
  options = options || {};

  options.config = options.config || config();
  options.controlMessageSequence = options.controlMessageSequence || controlMessageSequence();
  options.udpMessageStream = options.udpMessageStream || udpMessageStream();

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
  this.udpMessageStream = options.udpMessageStream;

  this._interval = null;
}

Control.prototype.resume = function() {
  clearInterval(this._interval);
  this._interval = setInterval(
    this.sendNextMessage.bind(this),
    this.config.udpInterval
  );
};

Control.prototype.sendNextMessage = function() {
  this.udpMessageStream.write(this.controlMessageSequence.next(this));
};

Control.prototype.toJSON = function() {
  var self = this;
  return Object.keys(this).reduce(function(json, key) {
    var value = self[key];

    var isObject = (typeof value === 'object');
    var isPrivate = (key.substr(0, 1) === '_');

    if (!isObject && !isPrivate) {
      json[key] = value;
    }

    return json
  }, {});
};

Control.prototype.inspect = function() {
  return util.inspect(this.toJSON());
};

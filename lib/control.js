var util = require('util');
var config = require('./config');
var controlMessageSequence = require('./control/controlMessageSequence');
var udpMessageStream = require('./control/udpMessageStream');
var createLog = require('./log');

module.exports = function control(options) {
  options = options || {};

  options.config = options.config || config();
  options.log = options.log || createLog(options);
  options.controlMessageSequence = options.controlMessageSequence || controlMessageSequence(options);
  options.udpMessageStream = options.udpMessageStream || udpMessageStream(options);

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
  this.log = options.log;

  this.writable = true;

  this._interval = null;
  this._requestedDemoOption = false;
}

Control.prototype.write = function(navdata) {
  this.requestDemoOptionIfNeeded(navdata);
};

Control.prototype.requestDemoOptionIfNeeded = function(navdata) {
  var hasDemoOption = (navdata.options.indexOf('demo') > -1);
  if (!hasDemoOption) {
    if (!this._requestedDemoOption) {
      this.log.write('control: received navdata without demo option, requesting it');
      this._requestedDemoOption = true;
    }

    // @TODO: Actually request demo option
  } else if (this._requestedDemoOption) {
    this.log.write('control: receiving demo options now');
    this._requestedDemoOption = false;
  }
};

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

var util = require('util');
var config = require('./config');
var createCommandStream = require('./control/commandStream');
var udpMessageStream = require('./control/udpMessageStream');
var createLog = require('./log');
var Stream = require('stream').Stream;

module.exports = function control(options) {
  options = options || {};

  options.config = options.config || config();
  options.log = options.log || createLog(options);
  options.commandStream = options.commandStream || createCommandStream(options);
  options.udpMessageStream = options.udpMessageStream || udpMessageStream(options);

  options.commandStream.pipe(options.udpMessageStream);

  return new Control(options);
};

module.exports.Control = Control;
util.inherits(Control, Stream);
function Control(options) {
  Stream.call(this);

  this.fly = false;
  this.emergency = false;
  this.upDown = 0;
  this.leftRight = 0;
  this.frontBack = 0;
  this.upDown = 0;
  this.clockSpin = 0;

  this.config = options.config;
  this.commandStream = options.commandStream;
  this.udpMessageStream = options.udpMessageStream;
  this.log = options.log;

  this.writable = true;
  this.readable = true;

  this._interval = null;
  this._requestedDemoOption = false;
  this._disableEmergency = false;
  this._prevNavdata = undefined;
}

Control.prototype.write = function(navdata) {
  this.requestDemoOptionIfNeeded(navdata);
  this.disableEmergencyIfNeeded(navdata);

  this._prevNavdata = navdata;
};

Control.prototype.requestDemoOptionIfNeeded = function(navdata) {
  var hasDemoOption = (navdata.options.indexOf('demo') > -1);
  if (!hasDemoOption) {
    if (!this._requestedDemoOption) {
      this.log.write('control: received navdata without demo option, requesting it ...');
      this._requestedDemoOption = true;
    }

    this.commandStream.config({
      key: 'general:navdata_demo',
      value: 'TRUE'
    });
    this.commandStream.flush();
  } else if (this._requestedDemoOption) {
    this.log.write('control: receiving demo options now');
    this._requestedDemoOption = false;
  }
};

Control.prototype.disableEmergencyIfNeeded = function(navdata) {
  var inEmergencyMode = navdata.status.emergencyLanding;
  var wasInEmergencyMode = this._prevNavdata && this._prevNavdata.status.emergencyLanding;

  if (!this._disableEmergency) {
    if (inEmergencyMode && !wasInEmergencyMode) {
      this.log.write('navdata: drone entered emergency mode');
    }

    return;
  }

  if (inEmergencyMode && !this.emergency) {
    this.log.write('control: drone in emergency mode, trying to disable ...');
    this.emergency = true;
  } else if (!inEmergencyMode && this.emergency) {
    this.log.write('control: disabled emergency mode');
    this.emergency = false;
    this._disableEmergency = false;
  } else if (!inEmergencyMode && !this.emergency) {
    this._disableEmergency = false;
  }
};

Control.prototype.resume = function() {
  clearInterval(this._interval);
  this._interval = setInterval(
    this.sendNextMessage.bind(this),
    this.config.udpInterval
  );

  this.disableEmergency();
};

Control.prototype.disableEmergency = function() {
  this._disableEmergency = true;
};

Control.prototype.sendNextMessage = function() {
  this.commandStream.ref(this);
  this.commandStream.pcmd(this);
  this.commandStream.flush();
  this.emit('data', this.toJSON());
};

Control.prototype.toJSON = function() {
  return {
    fly: this.fly,
    emergency: this.emergency,
    upDown: this.upDown,
    leftRight: this.leftRight,
    frontBack: this.frontBack,
    upDown: this.upDown,
    clockSpin: this.clockSpin,
  }
};

Control.prototype.inspect = function() {
  return util.inspect(this.toJSON());
};

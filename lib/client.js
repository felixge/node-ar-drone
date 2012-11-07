var EventEmitter = require('events').EventEmitter;
var util = require('util');

Client.UdpControl = require('./control/UdpControl');
Client.Repl = require('./Repl');
Client.UdpNavdataStream = require('./navdata.old/UdpNavdataStream');
Client.PngStream = require('./video/PngStream');

module.exports = Client;
util.inherits(Client, EventEmitter);
function Client(options) {
  EventEmitter.call(this);

  options = options || {};

  this.flyBit = false;
  this.emergencyBit = false;
  this.leftRight = 0;
  this.frontBack = 0;
  this.upDown = 0;
  this.clockSpin = 0;

  this._udpControl = options.udpControl || new Client.UdpControl(options);
  this._udpNavdatasStream = options.udpNavdataStream || new Client.UdpNavdataStream(options);
  this._pngStream = new Client.PngStream(options);
  this._interval = null;
  this._repeaters = [];
  this._afterOffset = 0;
  this._disableEmergency = false;
  this._lastState = 'CTRL_LANDED';
  this._lastBattery = 100;
  this._lastAltitude = 0;
}

Client.prototype.after = function(duration, fn) {
  setTimeout(fn.bind(this), this._afterOffset + duration);
  this._afterOffset += duration;
  return this;
};

Client.prototype.createRepl = function() {
  var repl = new Client.Repl(this);
  repl.resume();
  return repl;
};

Client.prototype.createPngStream = function() {
  this._pngStream.resume();
  return this._pngStream;
};

Client.prototype.resume = function() {
  this.disableEmergency();
  this._setInterval(30);

  this._udpNavdatasStream.removeAllListeners();
  this._udpNavdatasStream.resume();
  this._udpNavdatasStream
    .on('error', this._maybeEmitError.bind(this))
    .on('data', this._handleNavdata.bind(this));
};

Client.prototype._handleNavdata = function(navdata) {
  if (navdata.droneState && navdata.droneState.emergencyLanding && this._disableEmergency) {
    this.emergencyBit = true;
  } else {
    this.emergencyBit = false;
    this._disableEmergency = false;
  }

  // request demo navdata if 'demo' option is not included
  // also: don't emit navdata if 'demo' option is not present
  // @TODO: Make this behavior configurable in the constructor
  if (!navdata.demo) {
    this._udpControl.config('general:navdata_demo', 'TRUE');
  } else {
    // @TODO: Make this client.sensors.on('data') and make sensors a stream
    this.emit('navdata', navdata);
  }

  this._processNavdata(navdata);
};

Client.prototype._processNavdata = function(navdata) {
  if (navdata.droneState && navdata.demo) {
    // controlState events
    var cstate = navdata.demo.controlState;
    var emitState = (function(e, state) {
      if (cstate === state && this._lastState !== state) {
        return this.emit(e);
      }
    }).bind(this);
    emitState('landing', 'CTRL_TRANS_LANDING');
    emitState('landed', 'CTRL_LANDED');
    emitState('takeoff', 'CTRL_TRANS_TAKEOFF');
    emitState('hovering', 'CTRL_HOVERING');
    emitState('flying', 'CTRL_FLYING');
    this._lastState = cstate;

    // battery events
    var battery = navdata.demo.batteryPercentage;
    if (navdata.droneState.lowBattery === 1) {
      this.emit('lowBattery', battery);
    }
    if (navdata.demo.batteryPercentage !== this._lastBattery) {
      this.emit('batteryChange', battery);
      this._lastBattery = battery;
    }

    // altitude events
    var altitude = navdata.demo.altitudeMeters;
    if (altitude !== this._lastAltitude) {
      this.emit('altitudeChange', altitude);
      this._lastAltitude = altitude;
    }
  }

};

// emits an 'error' event, but only if somebody is listening. This avoids
// making node's EventEmitter throwing an exception for non-critical errors
Client.prototype._maybeEmitError = function(err) {
  if (this.listeners('error').length > 0) {
    this.emit('error', err);
  }
};

Client.prototype._setInterval = function(duration) {
  clearInterval(this._interval);
  this._interval = setInterval(this._sendCommands.bind(this), duration);
};

Client.prototype._sendCommands = function() {
  this._udpControl.ref({
    flyBit       : this.flyBit,
    emergencyBit : this.emergencyBit
  });

  this._udpControl.pcmd({
    leftRight : this.leftRight,
    frontBack : this.frontBack,
    upDown    : this.upDown,
    clockSpin : this.clockSpin,
  });

  this._udpControl.flush();

  this._repeaters
    .forEach(function(repeat) {
      repeat.times--;
      repeat.method();
    });

  this._repeaters = this._repeaters.filter(function(repeat) {
    return repeat.times > 0;
  });
};

Client.prototype.disableEmergency = function() {
  this._disableEmergency = true;
};

Client.prototype.takeoff = function() {
  this.flyBit = true;
};

Client.prototype.land = function() {
  this.flyBit = false;
};

Client.prototype.stop = function() {
  this.leftRight = 0;
  this.frontBack = 0;
  this.upDown = 0;
  this.clockSpin = 0;
};

Client.prototype.config = function(key, value) {
  // @TODO Figure out if we can get a ACK for this, so we don't need to
  // repeat it blindly like this
  var self = this;
  this._repeat(10, function() {
    self._udpControl.config(key, value);
  });
};

Client.prototype.animate = function(animation, duration) {
  // @TODO Figure out if we can get a ACK for this, so we don't need to
  // repeat it blindly like this
  var self = this;
  this._repeat(10, function() {
    self._udpControl.animate(animation, duration);
  });
};

Client.prototype.animateLeds = function(animation, hz, duration) {
  // @TODO Figure out if we can get a ACK for this, so we don't need to
  // repeat it blindly like this
  var self = this;
  this._repeat(10, function() {
    self._udpControl.animateLeds(animation, hz, duration);
  });
};

Client.prototype._repeat = function(times, fn) {
  this._repeaters.push({times: times, method: fn});
};

Client.prototype.left = function(speed) {
  this.leftRight = speed;
};

Client.prototype.right = function(speed) {
  this.leftRight = -speed;
};

Client.prototype.front = function(speed) {
  this.frontBack = speed;
};

Client.prototype.back = function(speed) {
  this.frontBack = -speed;
};

Client.prototype.up = function(speed) {
  this.upDown = speed;
};

Client.prototype.down = function(speed) {
  this.upDown = -speed;
};

Client.prototype.clockwise = function(speed) {
  this.clockSpin = speed;
};

Client.prototype.counterClockwise = function(speed) {
  this.clockSpin = -speed;
};

Client.prototype.toJSON = function() {
  var json = {};
  for (var key in this) {
    var isPrivate = (key.substr(0, 1) === '_');
    if (isPrivate) {
      continue;
    }

    var value = this[key];
    if (typeof value === 'function') {
      continue;
    }

    json[key] = value;
  }

  return json;
};

var EventEmitter = require('events').EventEmitter;
var util         = require('util');

Client.UdpControl       = require('./control/UdpControl');
Client.Repl             = require('./Repl');
Client.UdpNavdataStream = require('./navdata/UdpNavdataStream');
Client.PngStream        = require('./video/PngStream');

module.exports = Client;
util.inherits(Client, EventEmitter);
function Client(options) {
  EventEmitter.call(this);

  options = options || {};

  this._udpControl        = options.udpControl || new Client.UdpControl(options);
  this._udpNavdatasStream = options.udpNavdataStream || new Client.UdpNavdataStream(options);
  this._pngStream         = new Client.PngStream(options);
  this._interval          = null;
  this._ref               = {};
  this._pcmd              = {};
  this._repeaters         = [];
  this._afterOffset       = 0;
  this._disableEmergency  = false;
  this._takenOff          = false;
  this.callbacks          = {};
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
    this._ref.emergency = true;
  } else {
    this._ref.emergency    = false;
    this._disableEmergency = false;
  }
  if (navdata.demo && navdata.demo.controlState) {
    if (navdata.demo.controlState == 'CTRL_TRANS_TAKEOFF') {
      this._takenOff = true; //we need a state variable to know when the drone has taken off so that we know when its safe to execute the land callback since it both starts and ends with CTRL_LANDED
    }
    if (this.callbacks.takeoff) {
      if (navdata.demo.controlState != 'CTRL_TRANS_TAKEOFF' && navdata.demo.controlState != 'CTRL_LANDED') { //the drone always begins with LANDED and then changes to TAKEOFF - we want the callback to execute after it is done taking off
        this.callbacks.takeoff.call(this, navdata);
        this.callbacks.takeoff = null; //only want to execute takeoff callback the first time it happens
      }
    }
    if (this.callbacks.land) {
      if (this._takenOff == true && navdata.demo.controlState == 'CTRL_LANDED') {
        this.callbacks.land.call(this, navdata);
        this.callbacks.land = null;
      }
    }
  }

  this.emit('navdata', navdata);
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
  this._udpControl.ref(this._ref);
  this._udpControl.pcmd(this._pcmd);
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

Client.prototype.takeoff = function(cb) {
  this._ref.fly = true;
  this.callbacks.takeoff = cb;
  return true;
};

Client.prototype.land = function(cb) {
  this._ref.fly = false;
  this.callbacks.land = cb;
  return true;
};

Client.prototype.stop = function() {
  this._pcmd = {};
  return true;
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

var pcmdOptions = [
  ['up', 'down'],
  ['left', 'right'],
  ['front', 'back'],
  ['clockwise', 'counterClockwise'],
]

pcmdOptions.forEach(function(pair) {
  Client.prototype[pair[0]] = function(speed) {
    speed = parseFloat(speed);

    this._pcmd[pair[0]] = speed;
    delete this._pcmd[pair[1]];

    return speed;
  };

  Client.prototype[pair[1]] = function(speed) {
    speed = parseFloat(speed);

    this._pcmd[pair[1]] = speed;
    delete this._pcmd[pair[0]];

    return speed;
  };
});

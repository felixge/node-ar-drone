var repl         = require('repl');
var udp          = require('dgram');
var BitNumber    = require('./BitNumber');;
var EventEmitter = require('events').EventEmitter;
var util         = require('util');
var Navdata      = require('./Navdata');
var Repl         = require('./Repl');
var VideoStream  = require('./VideoStream');
var Sequence     = require('./Sequence');

module.exports = Client;
util.inherits(Client, EventEmitter);
function Client(options) {
  EventEmitter.call(this);

  this.config  = options.config;
  this.navdata = null;

  this._sequence      = 0;
  this._interval      = null;
  this._cmdSocket     = null;
  this._navDataSocket = null;
  this._repl          = null;

  this._movement = {
    leftRight : 0,
    frontBack : 0,
    vertical  : 0,
    angular   : 0,
  };

  // Connecting
  this._connectCb = null;

  // Takeoff / Landing
  this._takeoffState = 0; // 1 = takeoff, 0 = land
}

Client.prototype.connect = function(cb) {
  this._connectCb = cb;

  this._cmdSocket = udp.createSocket('udp4');
  this._interval  = setInterval(this._sendCommands.bind(this), this.config.sendInterval);

  this._navDataSocket = udp.createSocket('udp4');
  this._navDataSocket.on('message', this._handleNavdata.bind(this));

  this._navDataSocket.bind(this.config.navDataPort);

  // Not sure if this is really needed, but all the clients I looked at seem to
  // do it.
  this._navDataSocket.addMembership(this.config.multicastIp);

  var buffer = new Buffer([1]);
  this._navDataSocket.send(buffer, 0, buffer.length, this.config.navDataPort, this.config.ip);
};

Client.prototype.set = function(values) {
  for (var key in values) {
    var value = values[key];
    this[key](value);
  }
};

Client.prototype.takeoff = function() {
  this._takeoffState = 1;
};

Client.prototype.land = function() {
  this._takeoffState = 0;
};

Client.prototype.up = function(value) {
  this._movement.vertical = value;
};

Client.prototype.down = function(value) {
  this._movement.vertical = -value;
};

Client.prototype.turn = function(value) {
  this._movement.angular = value;
};

Client.prototype.right = function(value) {
  this._movement.leftRight = value;
};

Client.prototype.left = function(value) {
  this._movement.leftRight = -value;
};

Client.prototype.front = function(value) {
  this._movement.frontBack = -value;
};

Client.prototype.back = function(value) {
  this._movement.frontBack = value;
};

Client.prototype.stop = function() {
  for (var key in this._movement) {
    this._movement[key] = 0;
  }
};

Client.prototype._handleNavdata = function(buffer) {
  var previousNavdata = this.navdata;
  this.navdata        = Navdata.parse(buffer);

  if (!previousNavdata && this._connectCb) {
    this._connectCb(null, this.navdata);
    this._connectCb = null;
  }


  var diff = this.navdata.diff(previousNavdata)
  if (previousNavdata && JSON.stringify(diff) !== '{}') {
    this.emit('change', diff);
  }
};

Client.prototype._sendCommands = function() {
  // Don't send commands unless we have received navdata before
  if (!this.navdata) {
    return;
  }

  var self = this;
  var commands = [];

  var mode = (this._movement.leftRight || this._movement.frontBack)
    ? 1
    : 0;

  //commands.push([
    //'CONFIG',
    //'"general:navdata_demo"',
    //'"FALSE"',
  //]);

  //commands.push([
    //'CONFIG',
    //'"video:video_codec"',
    //'"131"',
  //]);

  commands.push([
    'PCMD_MAG',
    mode,
    Client.floatToInt(this._movement.leftRight),
    Client.floatToInt(this._movement.frontBack),
    Client.floatToInt(this._movement.vertical),
    Client.floatToInt(this._movement.angular),
    0,
    0
  ]);

  commands.push(['REF', new BitNumber({
    8: 1,
    // takeoff bit
    9: this._takeoffState,
    // these should all be one according to docs
    18: 1,
    20: 1,
    22: 1,
    24: 1,
    28: 1,
  })]);

  var message = commands
    .map(function(command) {
      var type = command.shift();
      var args = [++self._sequence].concat(command);

      return 'AT*' + type + '=' + args.join(',') + '\r';
    })
    .join('');

  if (!message) {
    message = '\r';
  }

  //console.log(JSON.stringify(message));

  var buffer = new Buffer(message);
  this._cmdSocket.send(buffer, 0, buffer.length, this.config.cmdPort, this.config.ip);
};

Client.prototype.videoStream = function() {
  var stream = new VideoStream({
    ip   : this.config.ip,
    port : this.config.videoPort,
  });

  stream.start();

  return stream;
};

Client.prototype.repl = function(config) {
  this._repl = new Repl(this);
  this._repl.start();
};

Client.prototype.sequence = function() {
  return new Sequence(this);
};

Client.floatToInt = function(number) {
  if (typeof number === 'string') {
    number = parseFloat(number);
  }

  // Not sure if this is correct, but it works for the example provided in
  // the drone manual ... (should be revisted)
  var buffer = new Buffer(4);
  buffer.writeFloatBE(number, 0);
  return -~parseInt(buffer.toString('hex'), 16) - 1;
};

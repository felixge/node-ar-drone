Client.UdpControl = require('./control/UdpControl');
Client.Repl       = require('./Repl');

module.exports = Client;
function Client(options) {
  options = options || {};

  this._udpControl = options.udpControl || new Client.UdpControl(options);
  this._interval   = null;
  this._ref        = {};
  this._pcmd       = {};
}

Client.prototype.createRepl = function() {
  var repl = new Client.Repl(this);
  repl.resume();
  return repl;
};

Client.prototype.resume = function() {
  this._setInterval(30);
};

Client.prototype._setInterval = function(duration) {
  clearInterval(this._interval);
  this._interval = setInterval(this._sendCommands.bind(this), duration);
};

Client.prototype._sendCommands = function() {
  this._udpControl.ref(this._ref);
  this._udpControl.pcmd(this._pcmd);
  this._udpControl.flush();
};

Client.prototype.takeoff = function() {
  this._ref.fly = true;
  return true;
};

Client.prototype.land = function() {
  this._ref.fly = false;
  return true;
};

Client.prototype.stop = function() {
  this._pcmd = {};
  return true;
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

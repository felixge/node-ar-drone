var AtCommandCreator = require('./AtCommandCreator');
var meta             = require('../misc/meta');
var constants        = require('../constants');
var dgram            = require('dgram');

module.exports = UdpControl;
function UdpControl(options) {
  options = options || {};

  this._socket     = options.socket || dgram.createSocket('udp4');
  this._port       = options.port || constants.ports.AT;
  this._ip         = options.ip ||  constants.DEFAULT_DRONE_IP;
  this._cmdCreator = new AtCommandCreator();
  this._cmds       = [];
}

meta.methods(AtCommandCreator).forEach(function(methodName) {
  UdpControl.prototype[methodName] = function() {
    var cmd = this._cmdCreator[methodName].apply(this._cmdCreator, arguments);
    this._cmds.push(cmd);
    return cmd;
  };
});

UdpControl.prototype.flush = function() {
  if (!this._cmds.length) {
    return;
  }

  var buffer = new Buffer(this._concat(this._cmds));
  this._socket.send(buffer, 0, buffer.length, this._port, this._ip);

  this._cmds    = [];
};

UdpControl.prototype._concat = function(commands) {
  return this._cmds.reduce(function(cmds, cmd) {
    return cmds + cmd;
  }, '');
};

UdpControl.prototype.close = function() {
  this._socket.close();
};

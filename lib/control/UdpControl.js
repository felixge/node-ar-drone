var assert           = require('assert');
var dgram            = require('dgram');

var debug            = require('simple-debug')('udpcontrol');

var AtCommandCreator = require('./AtCommandCreator');
var meta             = require('../misc/meta');
var constants        = require('../constants');


var DEFAULT_TIMEOUT = 500;  // ms

var states = {
  NOT_BLOCKED: 'NOT_BLOCKED',
  WAITING_FOR_ACK: 'WAITING_FOR_ACK',
  WAITING_FOR_ACK_RESET: 'WAITING_FOR_ACK_RESET'
};



module.exports = UdpControl;
function UdpControl(options) {
  options = options || {};

  this._sequenceNumber = 0;
  this._socket     = options.socket || dgram.createSocket('udp4');
  this._port       = options.port || constants.ports.AT;
  this._ip         = options.ip ||  constants.DEFAULT_DRONE_IP;
  this.defaultTimeout = options.defaultTimeout || DEFAULT_TIMEOUT;
  this._cmdCreator = new AtCommandCreator();
  this._cmds       = [];
  this._blockingCmds = [];
  this._blocked = {
    state: states.NOT_BLOCKED,
    cmd: null,
    ackTimer: null
  };
}

meta.methods(AtCommandCreator).forEach(function(methodName) {
  UdpControl.prototype[methodName] = function() {
    var cmd = this._cmdCreator[methodName].apply(this._cmdCreator, arguments);
    if (cmd.blocks) {
      this._blockingCmds.push(cmd);
    } else {
      this._cmds.push(cmd);
    }
    return cmd;
  };
});

UdpControl.prototype.ack = function() {
  if (this._blocked.state === states.WAITING_FOR_ACK) {
    assert(this._blocked.cmd);
    assert(this._blocked.ackTimer);
    debug('Got ACK for ' + this._blocked.cmd);
    clearTimeout(this._blocked.ackTimer);
    this._blocked.ackTimer = null;
    if (this._blocked.cmd.callback) {
      this._blocked.cmd.callback.call(this, null);
    }
    this._blocked.state = states.WAITING_FOR_ACK_RESET;
    debug('Resetting ACK');
    this.ctrl(5, 0);
    // Send ctrl(5, 0) every 50 ms until we get an ACK reset.
    var self = this;
    this._blocked.ctrlTimer = setInterval(
      function() {
        if (self.state === states.WAITING_FOR_ACK_RESET) {
          self.ctrl(5, 0);
        } else {
          clearInterval(self._blocked.ctrlTimer);
          self._blocked.ctrlTimer = null;
        }
      },
      50);
  }
};

UdpControl.prototype.ackReset = function() {
  if (this._blocked.state === states.WAITING_FOR_ACK_RESET) {
    assert(this._blocked.cmd);
    debug('Got ACK reset');
    this._blocked.cmd = null;
    this._blocked.state = states.NOT_BLOCKED;
  }
};

UdpControl.prototype._handleAckTimeout = function() {
  assert(this._blocked.state === states.WAITING_FOR_ACK);
  assert(this._blocked.ackTimer);
  assert(this._blocked.cmd);
  this._blocked.ackTimer = null;
  debug('Blocking command timed out:');
  debug(this._blocked.cmd);
  if (this._blocked.cmd.callback) {
    this._blocked.cmd.callback.call(this, new Error('ACK Timeout'));
  }
  this._blocked.cmd = null;
  this._blocked.state = states.NOT_BLOCKED;
};


UdpControl.prototype.flush = function() {
  if (this._cmds.length) {
    this._sendCommands(this._cmds);
    this._cmds = [];
  }
  if (this._blocked.state == states.NOT_BLOCKED && this._blockingCmds.length) {
    // Send the blocking command.
    var cmd = this._blockingCmds.shift();
    this._blocked.cmd = cmd;
    this._sendCommands([cmd]);
    this._blocked.state = states.WAITING_FOR_ACK;
    this._blocked.ackTimer = setTimeout(
      this._handleAckTimeout.bind(this),
      cmd.options.timeout || this.defaultTimeout);
  }
};

UdpControl.prototype._sendCommands = function(commands) {
  var serialized = this._concat(commands);
  debug(serialized.replace('\r', '|'));
  var buffer = new Buffer(serialized);
  this._socket.send(buffer, 0, buffer.length, this._port, this._ip);
};

UdpControl.prototype._concat = function(commands) {
  var self = this;
  return commands.reduce(function(cmds, cmd) {
    return cmds + cmd.serialize(self._sequenceNumber++);
  }, '');
};

UdpControl.prototype.close = function() {
  this._socket.close();
};

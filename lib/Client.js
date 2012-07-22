var repl         = require('repl');
var udp          = require('dgram');
var BitNumber    = require('./BitNumber');;
var EventEmitter = require('events').EventEmitter;
var util         = require('util');
var Navdata      = require('./Navdata');

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
  this._repl         = null;

  // Connecting
  this._connectCb = null;

  // Takeoff / Landing
  this._takeoffState = 0; // 1 = takeoff, 0 = land
  this._takeoffCb    = null;

  // Trimming
  this._trim   = false;
  this._trimCb = null;
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

Client.prototype._handleNavdata = function(buffer) {
  var previousNavdata = this.navdata;
  this.navdata        = Navdata.parse(buffer);

  if (!previousNavdata && this._connectCb) {
    this._connectCb(null, this.navdata);
    this._connectCb = null;
  }


  var diff = this.navdata.diff(previousNavdata)
  if (previousNavdata && JSON.stringify(diff) !== '{}') {
    //console.log('state changes:', diff);
  }

  // takeoff or landing completed
  if (diff.flying === Boolean(this._takeoffState)) {
    if (this._takeoffCb) {
      this._takeoffCb();
      this._takeoffCb = null;
    }
  }

  //this.emit('navdata', this.navdata);
  //for (var key in diff) {
    //this.emit('navdataChange', key, diff[key]);
  //}
};

Client.prototype.trim = function(cb) {
  this._trim   = true;
  this._trimCb = cb;
};

Client.prototype.takeoff = function(cb) {
  this._takeoffState = 1;
  this._takeoffCb    = cb;
};

Client.prototype.land = function(cb) {
  this._takeoffState = 0;
  this._takeoffCb    = cb;
};

Client.prototype._sendCommands = function() {
  // Don't send commands unless we have received navdata before
  if (!this.navdata) {
    return;
  }

  var self = this;
  var commands = [];

  if (this._trim) {
    commands.push(['FTRIM']);
  }

  commands.push(['PCMD', 0, 0, 0, 0, 0]);

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

  var buffer = new Buffer(message);
  this._cmdSocket.send(buffer, 0, buffer.length, this.config.cmdPort, this.config.ip);
};

Client.prototype.startRepl = function() {
  var self = this;

  process.stdout.write('Connecting to drone ... ');
  this.connect(function(err) {
    if (err) throw err;

    console.log('done!\n');

    Object
      .keys(self.constructor.prototype)
      .filter(function(method) {
        return typeof self[method] === 'function';
      })
      .forEach(function(method) {
        global[method] = function() {
          var args = Array.prototype.slice.call(arguments);

          args.push(function() {
            console.log('%s() yielded: ', method, Array.prototype.slice.call(arguments));
          });

          self[method].apply(self, args);
        };
      });

    self._repl = repl.start({prompt: 'drone> '});
  });
};

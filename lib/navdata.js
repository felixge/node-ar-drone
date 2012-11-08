var _ = require('underscore');
var util = require('util');
var Stream = require('stream').Stream;
var createMessage = require('./navdata/message');
var createUdpNavdataStream = require('./navdata/udpNavdataStream');
var createLog = require('./log');
var parseNavdata = require('./navdata/parse');

module.exports = function createNavdata(options) {
  options = options || {};
  options.log = options.log || createLog();
  options.udpStream = options.udpStream || createUdpNavdataStream(options);
  options.parseNavdata = options.parseNavdata || parseNavdata;

  var navdata = new Navdata(options);
  options.udpStream.pipe(navdata);

  return navdata;
};

module.exports.Navdata = Navdata;
util.inherits(Navdata, Stream);
function Navdata(options) {
  createMessage.Message.call(this);
  Stream.call(this);

  this.raw = options.udpStream;
  this.log = options.log;
  this.parseNavdata = options.parseNavdata;

  this.readable = true;
  this.writable = true;
}

Navdata.prototype.write = function(buffer) {
  try {
    var message = this.parseNavdata(buffer, this.log);
  } catch (err) {
    this.log.write('navdata: parse error: ' + err.stack);
    return;
  }

  if (message) {
    _.extend(this, message);
    this.emit('data', message);
  }
};

Navdata.prototype.toJSON = function() {
  var messageKeys = Object.keys(createMessage());
  return _.pick(this, messageKeys);
};

Navdata.prototype.inspect = function() {
  return util.inspect(this.toJSON());
};

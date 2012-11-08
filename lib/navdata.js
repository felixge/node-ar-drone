var util = require('util');
var Stream = require('stream').Stream;
var Message = require('./navdata/message').Message;
var createUdpNavdataStream = require('./navdata/udpNavdataStream');
var createLog = require('./log');

module.exports = function createNavdata(options) {
  options = options || {};
  options.log = options.log || createLog();
  options.udpStream = options.udpStream || createUdpNavdataStream(options);

  return new Navdata(options);
};

module.exports.Navdata = Navdata;
util.inherits(Navdata, Stream);
function Navdata(options) {
  Message.call(this);
  Stream.call(this);

  this.raw = options.udpStream;
  this.readable = true;
}

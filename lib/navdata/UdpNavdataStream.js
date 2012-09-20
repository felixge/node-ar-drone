var Stream = require('stream').Stream;
var util   = require('util');

module.exports = UdpNavdataStream;
util.inherits(UdpNavdataStream, Stream);
function UdpNavdataStream() {
  Stream.call(this);

  this.readable = true;
}

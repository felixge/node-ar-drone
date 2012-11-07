var util = require('util');
var Stream = require('stream').Stream;
var Message = require('./navdata/message').Message;

module.exports = function createNavdata() {
  return new Navdata();
};

module.exports.Navdata = Navdata;
util.inherits(Navdata, Stream);
function Navdata() {
  Message.call(this);
  Stream.call(this);

  this.readable = true;
}

var util = require('util');
var Stream = require('stream').Stream;
var Data = require('./navdata/data').Data;

module.exports = function createNavdata() {
  return new Navdata();
};

module.exports.Navdata = Navdata;
util.inherits(Navdata, Stream);
function Navdata() {
  Data.call(this);
  Stream.call(this);

  this.readable = true;
}

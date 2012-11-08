var util = require('util');
var Stream = require('stream').Stream;
var iso8601Date = require('./misc/iso8601Date');

var exports = module.exports = function createLog() {
  return new Log();
};

exports.Log = Log;
util.inherits(Log, Stream);
function Log() {
  Stream.call(this);

  this.readable = true;
}

Log.prototype.write = function(data) {
  data = iso8601Date() + '\t' + data + '\n';
  this.emit('data', data);
};

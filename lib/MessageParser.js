module.exports = MessageParser;
function MessageParser(buffer) {
  this._offset = 0;
  this._buffer = buffer;
}

MessageParser.prototype.bytesLeft = function() {
  return this._buffer.length - this._offset;
};

MessageParser.prototype.skip = function(bytes) {
  this._offset += bytes;
};

MessageParser.prototype.number = function(bytes) {
  var bytesRead = 0;
  var value     = 0;

  while (bytesRead < bytes) {
    var byte = this._buffer[this._offset++];

    value += byte * Math.pow(256, bytesRead);

    bytesRead++;
  }

  return value;
};

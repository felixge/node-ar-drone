var EventEmitter = require('events').EventEmitter;
var util         = require('util');

module.exports = PngSplitter;
util.inherits(PngSplitter, EventEmitter);
function PngSplitter() {
  EventEmitter.call(this);

  this.writable        = true;
  this._buffer         = new Buffer(0);
  this._offset         = 0;
  this._pngStartOffset = null;
  this._state          = 'header';
  this._chunk          = null;
}

PngSplitter.prototype.write = function(buffer) {
  this._buffer = Buffer.concat([this._buffer, buffer]);

  while (true) {
    switch (this._state) {
      case 'header':
        this._pngStartOffset = this._offset;

        if (this.remainingBytes() < 8) {
          return;
        }

        this._offset += 8;
        this._state = 'chunk.header';
        break;
      case 'chunk.header':
        if (this.remainingBytes() < 8) {
          return;
        }

        this._chunk = {
          length : this.unsignedNumber(4),
          type   : this.array(4).join(' '),
        };

        this._state = 'chunk.data';
        break;
     case 'chunk.data':
        var chunkSize = this._chunk.length + 4; // 4 bytes = CRC
        if (this.remainingBytes() < chunkSize) {
          return;
        }

        this._offset += chunkSize;

        // IEND chunk
        if (this._chunk.type == '73 69 78 68') {
          var png = this._buffer.slice(this._pngStartOffset, this._offset);
          this.emit('data', png);

          this._buffer = this._buffer.slice(this._offset);
          this._offset = 0;
          this._state  = 'header';
          break;
        }

        this._state = 'chunk.header'
        break;
    }
  }

  return true;
};

PngSplitter.prototype.remainingBytes = function() {
  return this._buffer.length - this._offset;
};

PngSplitter.prototype.array = function(bytes) {
  var array = [];

  for (var i = 0; i < bytes; i++) {
    array.push(this._buffer[this._offset++]);
  }

  return array;
};

PngSplitter.prototype.unsignedNumber = function(bytes) {
  var bytesRead = 0;
  var value     = 0;

  while (bytesRead < bytes) {
    var byte = this._buffer[this._offset++];

    value += byte * Math.pow(256, bytes - bytesRead - 1);

    bytesRead++;
  }

  return value;
};

PngSplitter.prototype.end = function() {
};

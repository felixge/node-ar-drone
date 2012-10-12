// The AR Drone 2.0 allows a tcp client to receive H264 (MPEG4.10 AVC) video
// from the drone. However, the frames are wrapped by Parrot Video
// Encapsulation (PaVE), which this class parses.

var util   = require('util');
var Stream = require('stream').Stream;
var buffy  = require('buffy');

module.exports = PaVEParser;
util.inherits(PaVEParser, Stream);
function PaVEParser() {
  Stream.call(this);

  this.writable = true;
  this.readable = true;

  this._parser = buffy.createReader();
  this._state  = 'header';
  this._frame  = undefined;
}

PaVEParser.HEADER_SIZE_SHORT = 64;
PaVEParser.HEADER_SIZE_LONG = 68;

PaVEParser.prototype.write = function(buffer) {
  var parser = this._parser;

  parser.write(buffer);

  while (true) {
    switch (this._state) {
      case 'header':
        if (parser.bytesAhead() < PaVEParser.HEADER_SIZE_LONG) {
          return;
        }

        this._frame = {
          signature               : parser.ascii(4),
          version                 : parser.uint8(),
          video_codec             : parser.uint8(),
          header_size             : parser.uint16LE(),
          payload_size            : parser.uint32LE(),
          encoded_stream_width    : parser.uint16LE(),
          encoded_stream_height   : parser.uint16LE(),
          display_width           : parser.uint16LE(),
          display_height          : parser.uint16LE(),
          frame_number            : parser.uint32LE(),
          timestamp               : parser.uint32LE(),
          total_chunks            : parser.uint8(),
          chunk_index             : parser.uint8(),
          frame_type              : parser.uint8(),
          control                 : parser.uint8(),
          stream_byte_position_lw : parser.uint32LE(),
          stream_byte_position_uw : parser.uint32LE(),
          stream_id               : parser.uint16LE(),
          total_slices            : parser.uint8(),
          slice_index             : parser.uint8(),
          header1_size            : parser.uint8(),
          header2_size            : parser.uint8(),
          reserved2               : parser.buffer(2),
          advertised_size         : parser.uint32LE(),
          reserved3               : parser.buffer(12),
          payload                 : null,
        };

        if (this._frame.signature !== 'PaVE') {
          this.emit('error', new Error('Invalid signature: ' + JSON.stringify(this._frame.signature)));
          // TODO: skip forward until next frame
          return;
        }

        // stupid kludge for https://projects.ardrone.org/issues/show/159
        parser.buffer(this._frame.header_size - PaVEParser.HEADER_SIZE_SHORT);

        this._state = 'payload';
        break;
      case 'payload':
        if (parser.bytesAhead() < this._frame.payload_size) {
          return;
        }

        this._frame.payload = parser.buffer(this._frame.payload_size);

        this.emit('data', this._frame);
        this._frame = undefined;
        this._state = 'header';
        break;
    }
  }

  return true;
};

PaVEParser.prototype.end = function() {
  // nothing to do, just here so pipe() does not complain
};

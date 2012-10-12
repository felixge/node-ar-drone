var common     = require('../../common');
var assert     = require('assert');
var test       = require('utest');
var PaVEParser = require(common.lib + '/video/PaVEParser');
var fs         = require('fs');
var sinon      = require('sinon');
var fixture    = fs.readFileSync(common.fixtures + '/pave.bin');
var fixture68  = fs.readFileSync(common.fixtures + '/pave-68.bin');

test('PaVEParser', {
  before: function() {
    this.parser = new PaVEParser();
  },

  'parses fixture properly': function() {
    var frames = [];
    this.parser.on('data', function(frame) {
      frames.push(frame);
    });

    this.parser.write(fixture);

    assert.equal(frames.length, 20);

    var first = frames[0];

    assert.equal(first.signature, 'PaVE');
    assert.equal(first.version, 2);
    assert.equal(first.video_codec, 4);
    assert.equal(first.header_size, 64);
    assert.equal(first.payload_size, 2632);
    assert.equal(first.encoded_stream_width, 640);
    assert.equal(first.encoded_stream_height, 368);
    assert.equal(first.display_width, 640);
    assert.equal(first.display_height, 360);
    assert.equal(first.frame_number, 17368);
    assert.equal(first.timestamp, 1792570814);
    assert.equal(first.total_chunks, 1);
    assert.equal(first.chunk_index, 0);
    assert.equal(first.frame_type, 3);
    assert.equal(first.control, 0);
    assert.equal(first.stream_byte_position_lw, 72366960);
    assert.equal(first.stream_byte_position_uw, 0);
    assert.equal(first.stream_id, 5);
    assert.equal(first.total_slices, 1);
    assert.equal(first.slice_index, 0);
    assert.equal(first.header1_size, 0);
    assert.equal(first.header2_size, 0);
    assert.equal(first.reserved2.length, 2);
    assert.equal(first.advertised_size, 2632);
    assert.equal(first.reserved3.length, 12);
    assert.equal(first.payload.length, 2632);
  },

  'parses 68 byte frames properly': function() {
    var frames = [];
    this.parser.on('data', function(frame) {
      frames.push(frame);
    });

    this.parser.write(fixture68);

    assert.equal(frames.length, 5);

    var first = frames[0];

    assert.equal(first.signature, 'PaVE');
    assert.equal(first.version, 2);
    assert.equal(first.video_codec, 4);
    assert.equal(first.header_size, 68);
    assert.equal(first.payload_size, 10180);
    assert.equal(first.encoded_stream_width, 640);
    assert.equal(first.encoded_stream_height, 368);
    assert.equal(first.display_width, 640);
    assert.equal(first.display_height, 360);
    assert.equal(first.frame_number, 245401);
    assert.equal(first.timestamp, 8015353);
    assert.equal(first.total_chunks, 1);
    assert.equal(first.chunk_index, 0);
    assert.equal(first.frame_type, 1);
    assert.equal(first.control, 0);
    assert.equal(first.stream_byte_position_lw, 1009151980);
    assert.equal(first.stream_byte_position_uw, 0);
    assert.equal(first.stream_id, 1);
    assert.equal(first.total_slices, 1);
    assert.equal(first.slice_index, 0);
    assert.equal(first.header1_size, 14);
    assert.equal(first.header2_size, 10);
    assert.equal(first.reserved2.length, 2);
    assert.equal(first.advertised_size, 10180);
    assert.equal(first.reserved3.length, 12);
    assert.equal(first.payload.length, 10180);
  },


  'emits error on bad signature': function() {
    var buffer = new Buffer(68);

    // should be PaVE, not fuck
    buffer.write('fuck');

    var errorStub = sinon.stub();
    this.parser.on('error', errorStub);

    this.parser.write(buffer);

    assert.equal(errorStub.callCount, 1);
    assert.equal(/signature/i.test(errorStub.getCall(0).args[0]), true);
  },

  'end method exists, but does nothing': function() {
    this.parser.end();
  },
});

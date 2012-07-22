var common  = require('../common');
var assert  = require('assert');
var utest   = require('utest');
var Navdata = require(common.lib + '/Navdata');

utest('Navdata', {
  'parse example packet': function() {
    var buffer = new Buffer([
      0x88,
      0x77,
      0x66,
      0x55,
      0x90,
      0x0c,
      0x80,
      0x4f,
      0xf4,
      0xd2,
      0x00,
      0x00,
      0x01,
      0x00,
      0x00,
      0x00,
      0xff,
      0xff,
      0x08,
      0x00,
      0xec,
      0x04,
      0x00,
      0x00
    ]);

    var navdata = Navdata.parse(buffer);
    assert.equal(navdata.sequence, 54004);

    console.log(navdata);
  },

  'invalid header': function() {
    // The navdata packets are always supposed to start with:
    // 0x88, 0x77, 0x55, 0x90 (the sequence below is slightly wrong).
    var buffer = new Buffer([0x88, 0x77, 0x55, 0x91]);

    assert.throws(function() {
      Navdata.parse(buffer);
    }, /header/i);
  },
});

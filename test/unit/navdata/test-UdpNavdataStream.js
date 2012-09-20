var common           = require('../../common');
var assert           = require('assert');
var test             = require('utest');
var sinon            = require('sinon');
var UdpNavdataStream = require(common.lib + '/navdata/UdpNavdataStream');

test('UdpNavdataStream', {
  before: function() {
    this.stream = new UdpNavdataStream();
  },

  'is a readable stream': function() {
    assert.equal(this.stream.readable, true);
    assert.equal(typeof this.stream.pipe, 'function');
  },
});

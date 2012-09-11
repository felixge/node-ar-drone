var common         = require('../../common');
var assert         = require('assert');
var test           = require('utest');
//var sinon          = require('sinon');
//var EventEmitter   = require('events').EventEmitter;
var PngStream = require(common.lib + '/video/PngStream');

test('PngStream', {
  before: function() {
    this.stream = new PngStream();
  },

  'is a readable stream': function() {
    assert.equal(this.stream.readable, true);
    assert.equal(typeof this.stream.pipe, 'function');
  },
});

var common    = require('../common');
var assert    = require('assert');
var utest     = require('utest');
var BitNumber = require(common.lib + '/BitNumber');

utest('BitNumber', {
  before: function() {
    this.number = new BitNumber();
  },

  'setting bits': function() {
    this.number.setBit(0);
    this.number.setBit(3);

    assert.equal(this.number.toString(2), '1001');
  },

  'setting bits is idempotent': function() {
    this.number.setBit(0);
    this.number.setBit(3);
    this.number.setBit(3);

    assert.equal(this.number.toString(2), '1001');
  },

  'unsetting bits': function() {
    this.number.setBit(0);
    this.number.setBit(3);
    this.number.setBit(0, 0);

    assert.equal(this.number.toString(2), '1000');
  },

  'unsetting bits is idempotent': function() {
    this.number.setBit(0);
    this.number.setBit(3);
    this.number.setBit(0, 0);
    this.number.setBit(0, 0);

    assert.equal(this.number.toString(2), '1000');
  },

  'toString() defaults to base 10': function() {
    this.number.setBit(3);

    assert.equal(this.number.toString(), 8);
  },

  'construct from bit map': function() {
    this.number = new BitNumber({0: 1, 3: 1});
    assert.equal(this.number.toString(2), '1001');
  },
});

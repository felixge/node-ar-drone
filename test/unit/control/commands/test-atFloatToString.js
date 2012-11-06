var common          = require('../../../common');
var assert          = require('assert');
var test            = require('utest');
var atFloatToString = require(common.lib + '/control/atFloatToString');

test('atFloatToString', {
  'undefined returns 0': function() {
    assert.strictEqual(atFloatToString(undefined), 0);
  },

  '-0.8': function() {
    assert.equal(atFloatToString(-0.8), -1085485875);
  },

  '"-0.8"': function() {
    assert.equal(atFloatToString('-0.8'), -1085485875);
  },

  '0': function() {
    assert.equal(atFloatToString(0), 0);
  },
});

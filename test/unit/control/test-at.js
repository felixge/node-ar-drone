var common = require('../../common');
var assert = require('assert');
var test   = require('utest');
var at     = require(common.lib + '/control/at');

test('at', {
  '-0.8': function() {
    assert.equal(at.floatString(-0.8), -1085485875);
  },

  '0': function() {
    assert.equal(at.floatString(0), 0);
  },
});

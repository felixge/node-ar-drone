var common = require('../common');
var assert = require('assert');
var utest  = require('utest');
var Client = require(common.lib + '/Client');

utest('Client#floatToInt', {
  before: function() {
  },

  '-0.8': function() {
    assert.equal(Client.floatToInt(-0.8), -1085485875);
  },

  '-0.8 as a string': function() {
    assert.equal(Client.floatToInt('-0.8'), -1085485875);
  },

  '0': function() {
    assert.equal(Client.floatToInt(0), 0);
  },
});

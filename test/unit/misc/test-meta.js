var common = require('../../common');
var assert = require('assert');
var test   = require('utest');
var meta   = require(common.lib + '/misc/meta');

function SampleClass() {}
SampleClass.prototype.a = function() {};
SampleClass.prototype.b = function() {};
SampleClass.prototype._c = function() {};
SampleClass.prototype._d = function() {};

test('meta', {
  'methods': function() {
    assert.deepEqual(meta.methods(SampleClass), ['a', 'b']);
  },
});

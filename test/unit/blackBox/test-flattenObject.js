var common = require('../../common');
var assert = require('assert');
var test = require('utest');
var flattenObject = require(common.lib + '/blackBox/flattenObject');

test('flattenObject', {
  'returns a flat object with dot separators': function() {
    var obj = {
      foo: 'bar',
      deep: {
        a: true,
        b: {
          c: 1,
        },
        d: false
      }
    };

    var flat = flattenObject(obj);
    var expected = {
      foo: 'bar',
      'deep.a': true,
      'deep.b.c': 1,
      'deep.d': false,
    };

    assert.deepEqual(flat, expected);
  },
});

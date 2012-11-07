var common = require('../common');
var assert = require('assert');
var test = require('utest');
var createNavdata = require(common.lib + '/navdata');
var createData = require(common.lib + '/navdata/data');

test('navdata', {
  before: function() {
    this.navdata = createNavdata();
  },

  'has all sensor data properties': function() {
    var data = createData();

    // do a shallow check
    for (var key in data) {
      assert.ok(key in this.navdata, key);
    }
  },

  'readable stream interface': function() {
    assert.strictEqual(this.navdata.readable, true);
    assert.strictEqual(typeof this.navdata.pipe, 'function');
  },
});

var common = require('../common');
var assert = require('assert');
var test = require('utest');
var createSensors = require(common.lib + '/sensors');
var createData = require(common.lib + '/sensors/data');

test('sensors', {
  before: function() {
    this.sensors = createSensors();
  },

  'has all sensor data properties': function() {
    var data = createData();

    // do a shallow check
    for (var key in data) {
      assert.ok(key in this.sensors, key);
    }
  },

  'readable stream interface': function() {
    assert.strictEqual(this.sensors.readable, true);
    assert.strictEqual(typeof this.sensors.pipe, 'function');
  },
});

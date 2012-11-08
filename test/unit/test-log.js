var common = require('../common');
var assert = require('assert');
var test = require('utest');
var sinon = require('sinon');
var createLog = require(common.lib + '/log');
var iso8601Date = require(common.lib + '/misc/iso8601Date');

test('log', {
  before: function() {
    this.log = createLog();
    this.clock = sinon.useFakeTimers();
  },

  after: function() {
    this.clock.restore();
  },

  'readable stream': function() {
    assert.strictEqual(this.log.readable, true);
    assert.strictEqual(typeof this.log.pipe, 'function');
  },

  'writing a string emits it as "data" + newline': function() {
    var string = 'foo';
    var expected = iso8601Date() + '\t' + string + '\n';

    var dataSpy = sinon.spy();
    this.log.on('data', dataSpy);
    this.log.write(string);

    assert.strictEqual(dataSpy.callCount, 1);
    assert.strictEqual(dataSpy.lastCall.args[0], expected);
  },
});

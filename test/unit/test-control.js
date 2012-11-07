var common = require('../common');
var assert = require('assert');
var test = require('utest');
var sinon = require('sinon');
var control = require(common.lib + '/control');
var message = require(common.lib + '/control/message');

test('control', {
  before: function() {
    this.clock = sinon.useFakeTimers();
    this.control = control();
    this.config = this.control.config;
    this.udpMessageStream = this.control.udpMessageStream;
    this.controlMessageSequence = this.control.controlMessageSequence;
  },

  after: function() {
    this.clock.restore();
  },

  'constructor': function() {
    assert.equal(this.control.fly, false);
    assert.equal(this.control.emergency, false);
    assert.equal(this.control.leftRight, 0);
    assert.equal(this.control.frontBack, 0);
    assert.equal(this.control.upDown, 0);
    assert.equal(this.control.clockSpin, 0);
  },

  'sends next message to udp stream every config.timeout': function() {
    var msg = message();

    sinon.stub(this.udpMessageStream, 'write');
    sinon.stub(this.controlMessageSequence, 'next').returns(msg);

    this.clock.tick(this.config.udpInterval);

    assert.equal(this.udpMessageStream.write.callCount, 1);
    var args = this.udpMessageStream.write.getCall(0).args;
    assert.strictEqual(args.length, 1);
    assert.strictEqual(args[0], msg);

    var nextArgs = this.controlMessageSequence.next.getCall(0).args;
    assert.strictEqual(nextArgs[0], this.control);
  },

  'toJSON: returns a copy of just the data': function() {
    var json = this.control.toJSON();

    // check one value
    assert.strictEqual(json.leftRight, 0);

    // make sure modifying it does not modify the control
    json.leftRight = 5;
    assert.strictEqual(this.control.leftRight, 0);

    // also make sure functions were not copied
    assert.strictEqual(json.toJSON, undefined);

    // and out objects are not copied either
    assert.strictEqual(json.config, undefined);

    // and filters out private stuff
    assert.strictEqual(json._interval, undefined);
  },
});

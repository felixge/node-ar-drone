var common = require('../common');
var assert = require('assert');
var test = require('utest');
var sinon = require('sinon');
var createControl = require(common.lib + '/control');
var createMessage = require(common.lib + '/control/message');
var createNavdata = require(common.lib + '/navdata/message');

test('control', {
  before: function() {
    this.clock = sinon.useFakeTimers();
    this.control = createControl();
    this.config = this.control.config;
    this.udpMessageStream = this.control.udpMessageStream;
    this.controlMessageSequence = this.control.controlMessageSequence;
    this.log = this.control.log;

    sinon.stub(this.log, 'write');
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

  'writable stream interface': function() {
    assert.strictEqual(this.control.writable, true);
    assert.strictEqual(typeof this.control.write, 'function');
  },

  'sends next message to udp stream every config.timeout': function() {
    var msg = createMessage();

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

  'write: missing "demo" options requests additional data': function() {
    var navdata = createNavdata();
    this.control.write(navdata);

    assert.strictEqual(this.log.write.callCount, 1);

    // no log entry is made the second time
    this.control.write(navdata);
    assert.strictEqual(this.log.write.callCount, 1);

    // one log entry is made once we receive demo options
    navdata.options.push('demo');
    this.control.write(navdata);
    assert.strictEqual(this.log.write.callCount, 2);

    // second message won't trigger log again
    this.control.write(navdata);
    assert.strictEqual(this.log.write.callCount, 2);
  },
});

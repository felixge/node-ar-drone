var common = require('../common');
var assert = require('assert');
var test   = require('utest');
var sinon  = require('sinon');
var Client = require(common.lib + '/Client');

test('Client', {
  before: function() {
    this.fakeUdpControl       = {};
    this.fakeUdpControl.ref   = sinon.stub();
    this.fakeUdpControl.pcmd  = sinon.stub();
    this.fakeUdpControl.flush = sinon.stub();

    this.client = new Client({
      udpControl: this.fakeUdpControl,
    });

    this.clock = sinon.useFakeTimers();
  },

  after: function() {
    this.clock.restore();
  },

  'options are passed to internal UdpControl': function() {
    var options = {fake: 'options'};

    var gotOptions;
    Client.UdpControl = function(options) {
      gotOptions = options;
    };

    var client = new Client(options);
    assert.strictEqual(gotOptions, options);
  },

  'setInterval caused period ref / pcmd commands': function() {
    var defaultInterval = 30;

    this.client.setInterval();
    assert.equal(this.fakeUdpControl.ref.callCount, 0);
    assert.equal(this.fakeUdpControl.pcmd.callCount, 0);
    assert.equal(this.fakeUdpControl.flush.callCount, 0);

    this.clock.tick(defaultInterval);
    assert.equal(this.fakeUdpControl.ref.callCount, 1);
    assert.equal(this.fakeUdpControl.pcmd.callCount, 1);
    assert.equal(this.fakeUdpControl.flush.callCount, 1);
    assert.strictEqual(this.client._pcmd, this.fakeUdpControl.pcmd.getCall(0).args[0]);
    assert.strictEqual(this.client._ref, this.fakeUdpControl.ref.getCall(0).args[0]);

    this.clock.tick(defaultInterval);
    assert.equal(this.fakeUdpControl.ref.callCount, 2);
    assert.equal(this.fakeUdpControl.pcmd.callCount, 2);
  },

  'setInterval clears previous interval if set': function() {
    this.client.setInterval(30);
    this.client.setInterval(20);

    this.clock.tick(20);
    assert.equal(this.fakeUdpControl.ref.callCount, 1);

    this.clock.tick(10);
    assert.equal(this.fakeUdpControl.ref.callCount, 1);
  },


  'ref options are exposed as methods': function() {
    this.client.takeoff();
    assert.equal(this.client._ref.fly, true);

    this.client.land();
    assert.equal(this.client._ref.fly, false);
  },

  'pcmd options are exposed as methods': function() {
    this.client.up(0.5);
    assert.equal(this.client._pcmd.up, 0.5);
    assert.equal(this.client._pcmd.down, undefined);

    this.client.down(0.5);
    assert.equal(this.client._pcmd.down, 0.5);
    assert.equal(this.client._pcmd.up, undefined);

    this.client.left(0.5);
    assert.equal(this.client._pcmd.left, 0.5);
    assert.equal(this.client._pcmd.right, undefined);

    this.client.right(0.5);
    assert.equal(this.client._pcmd.right, 0.5);
    assert.equal(this.client._pcmd.left, undefined);

    this.client.front(0.5);
    assert.equal(this.client._pcmd.front, 0.5);
    assert.equal(this.client._pcmd.back, undefined);

    this.client.back(0.5);
    assert.equal(this.client._pcmd.back, 0.5);
    assert.equal(this.client._pcmd.front, undefined);

    this.client.clockwise(0.5);
    assert.equal(this.client._pcmd.clockwise, 0.5);
    assert.equal(this.client._pcmd.counterClockwise, undefined);

    this.client.counterClockwise(0.5);
    assert.equal(this.client._pcmd.counterClockwise, 0.5);
    assert.equal(this.client._pcmd.clockwise, undefined);
  },

  'pcmd methods conver strings to floats': function() {
    this.client.up('-0.5');
    assert.strictEqual(this.client._pcmd.up, -0.5);

    this.client.down('-0.5');
    assert.strictEqual(this.client._pcmd.down, -0.5);
  },

  'stop resets pcmd commands': function() {
    this.client.up(0.5);

    this.client.stop();
    assert.deepEqual(this.client._pcmd, {});
  },
});

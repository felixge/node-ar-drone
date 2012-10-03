var common       = require('../common');
var assert       = require('assert');
var test         = require('utest');
var sinon        = require('sinon');
var Client       = require(common.lib + '/Client');
var EventEmitter = require('events').EventEmitter;

test('Client', {
  before: function() {
    this.fakeUdpControl             = {};
    this.fakeUdpControl.ref         = sinon.stub();
    this.fakeUdpControl.pcmd        = sinon.stub();
    this.fakeUdpControl.animateLeds = sinon.stub();
    this.fakeUdpControl.animate     = sinon.stub();
    this.fakeUdpControl.flush       = sinon.stub();

    this.fakeUdpNavdataStream        = new EventEmitter;
    this.fakeUdpNavdataStream.resume = sinon.stub();

    this.client = new Client({
      udpControl       : this.fakeUdpControl,
      udpNavdataStream : this.fakeUdpNavdataStream,
    });

    this.clock = sinon.useFakeTimers();
  },

  after: function() {
    this.clock.restore();
  },

  'resume() calls _setInterval': function() {
    sinon.spy(this.client, '_setInterval');
    this.client.resume();

    assert.equal(this.client._setInterval.callCount, 1);
    assert.equal(this.client._setInterval.getCall(0).args[0], 30);
  },

  'navdata "data" events are proxied': function() {
    var fakeNavdata = {fake: 'navdata'};
    this.client.resume();

    assert.equal(this.fakeUdpNavdataStream.resume.callCount, 1);

    var gotNavdata;
    this.client.on('navdata', function(navdata) {
      gotNavdata = navdata;
    });

    this.fakeUdpNavdataStream.emit('data', fakeNavdata);

    assert.strictEqual(gotNavdata, fakeNavdata);
  },

  'navdata "error" events are ignored by default': function() {
    this.client.resume();

    this.fakeUdpNavdataStream.emit('error', new Error('bad'));
  },

  'navdata "error" events are proxied if there is an error listener': function() {
    var errorStub = sinon.stub();
    this.client.on('error', errorStub);
    this.client.resume();

    var fakeErr = new Error('bad');
    this.fakeUdpNavdataStream.emit('error', fakeErr);

    assert.equal(errorStub.callCount, 1);
    assert.strictEqual(errorStub.getCall(0).args[0], fakeErr);
  },

  'resume() is idempotent': function() {
    var fakeNavdata = {fake: 'navdata'};
    this.client.resume();
    this.client.resume();

    var eventCount = 0;
    this.client.on('navdata', function(navdata) {
      eventCount++;
    });

    this.fakeUdpNavdataStream.emit('data', fakeNavdata);

    assert.strictEqual(eventCount, 1);
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

  '_setInterval caused period ref / pcmd commands': function() {
    this.client._setInterval(30);
    assert.equal(this.fakeUdpControl.ref.callCount, 0);
    assert.equal(this.fakeUdpControl.pcmd.callCount, 0);
    assert.equal(this.fakeUdpControl.flush.callCount, 0);

    this.clock.tick(30);
    assert.equal(this.fakeUdpControl.ref.callCount, 1);
    assert.equal(this.fakeUdpControl.pcmd.callCount, 1);
    assert.equal(this.fakeUdpControl.flush.callCount, 1);
    assert.strictEqual(this.client._pcmd, this.fakeUdpControl.pcmd.getCall(0).args[0]);
    assert.strictEqual(this.client._ref, this.fakeUdpControl.ref.getCall(0).args[0]);

    this.clock.tick(30);
    assert.equal(this.fakeUdpControl.ref.callCount, 2);
    assert.equal(this.fakeUdpControl.pcmd.callCount, 2);
  },

  '_setInterval clears previous interval if set': function() {
    this.client._setInterval(30);
    this.client._setInterval(20);

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

  'animateLeds(): sends config command 10 times': function() {
    this.client.resume();
    this.client.animateLeds('blinkGreen', 2, 5);

    for (var i = 1; i <= 10; i++) {
      this.clock.tick(30);
      assert.equal(this.fakeUdpControl.animateLeds.callCount, i);
    }

    // Stop repeating after 10 intervals
    this.clock.tick(30);
    assert.equal(this.fakeUdpControl.animateLeds.callCount, 10);

    // Check that the arguments were right
    var args = this.fakeUdpControl.animateLeds.getCall(0).args;
    assert.equal(args.length, 3);
    assert.equal(args[0], 'blinkGreen');
    assert.equal(args[1], 2);
    assert.equal(args[2], 5);
  },

  'animate(): sends config 10 times': function() {
    this.client.resume();
    this.client.animate('yawShake', 2000);

    for (var i = 1; i <= 10; i++) {
      this.clock.tick(30);
      assert.equal(this.fakeUdpControl.animate.callCount, i);
    }

    // Stop repeating after 10 intervals
    this.clock.tick(30);
    assert.equal(this.fakeUdpControl.animate.callCount, 10);

    // Check that the arguments were right
    var args = this.fakeUdpControl.animate.getCall(0).args;
    assert.equal(args.length, 2);
    assert.equal(args[0], 'yawShake');
    assert.equal(args[1], 2000);
  },
});

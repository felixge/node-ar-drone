var common       = require('../common');
var assert       = require('assert');
var test         = require('utest');
var sinon        = require('sinon');
var Client       = require(common.lib + '/Client');
var PngStream    = Client.PngStream;
var EventEmitter = require('events').EventEmitter;

test('Client', {
  before: function() {
    this.fakeUdpControl             = {};
    this.fakeUdpControl.ref         = sinon.stub();
    this.fakeUdpControl.pcmd        = sinon.stub();
    this.fakeUdpControl.animateLeds = sinon.stub();
    this.fakeUdpControl.animate     = sinon.stub();
    this.fakeUdpControl.config      = sinon.stub();
    this.fakeUdpControl.flush       = sinon.stub();

    this.fakeUdpNavdataStream        = new EventEmitter;
    this.fakeUdpNavdataStream.resume = sinon.stub();

    this.pngStream   = new PngStream();
    Client.PngStream = sinon.stub();
    Client.PngStream.returns(this.pngStream);

    this.options = {
      udpControl       : this.fakeUdpControl,
      udpNavdataStream : this.fakeUdpNavdataStream,
    };

    this.client = new Client(this.options);

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

  'resume() calls disableEmergency': function() {
    sinon.spy(this.client, 'disableEmergency');
    this.client.resume();

    assert.equal(this.client.disableEmergency.callCount, 1);
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

  'navdata custom controlState events are triggered': function() {
    // takeoff event
    var fakeNavdataTakeoff = {
      droneState: 'navdata',
      demo: {controlState: 'CTRL_TRANS_TAKEOFF'}
    };
    this.client.resume();

    var gotEventTakeoff;
    this.client.on('takeoff', function() {
      gotEventTakeoff = true;
    });

    this.fakeUdpNavdataStream.emit('data', fakeNavdataTakeoff);
    assert.equal(gotEventTakeoff, true);

    // hovering event
    var fakeNavdataHovering = {
      droneState: 'navdata',
      demo: {controlState: 'CTRL_HOVERING'}
    };

    var gotEventHovering;
    this.client.on('hovering', function() {
      gotEventHovering = true;
    });

    this.fakeUdpNavdataStream.emit('data', fakeNavdataHovering);
    assert.equal(gotEventHovering, true);

    // flying event
    var fakeNavdataFlying = {
      droneState: 'navdata',
      demo: {controlState: 'CTRL_FLYING'}
    };

    var gotEventFlying;
    this.client.on('flying', function() {
      gotEventFlying = true;
    });

    this.fakeUdpNavdataStream.emit('data', fakeNavdataFlying);
    assert.equal(gotEventFlying, true);

    // landing event
    var fakeNavdataLanding = {
      droneState: 'navdata',
      demo: {controlState: 'CTRL_TRANS_LANDING'}
    };

    var gotEventLanding;
    this.client.on('landing', function() {
      gotEventLanding = true;
    });

    this.fakeUdpNavdataStream.emit('data', fakeNavdataLanding);
    assert.equal(gotEventLanding, true);

    // landed event
    var fakeNavdataLanded = {
      droneState: 'navdata',
      demo: {controlState: 'CTRL_LANDED'}
    };

    var gotEventLanded;
    this.client.on('landed', function() {
      gotEventLanded = true;
    });

    this.fakeUdpNavdataStream.emit('data', fakeNavdataLanded);
    assert.equal(gotEventLanded, true);
  },

  'navdata custom battery events are triggered': function() {
    // takeoff event
    var fakeNavdata = {
      droneState: {lowBattery:1},
      demo: {batteryPercentage: 23}
    };
    this.client.resume();

    var gotEventLow;
    this.client.on('lowBattery', function(level) {
      assert.equal(level, fakeNavdata.demo.batteryPercentage);
      gotEventLow = true;
    });

    var gotEventLevel;
    this.client.on('batteryChange', function(level) {
      assert.equal(level, fakeNavdata.demo.batteryPercentage);
      gotEventLevel = true;
    });

    this.fakeUdpNavdataStream.emit('data', fakeNavdata);
    assert.equal(gotEventLow, true);
    assert.equal(gotEventLevel, true);
  },

  'navdata custom altitude events are triggered': function() {
    // takeoff event
    var fakeNavdata = {
      droneState: 'navdata',
      demo: {altitudeMeters: 23.5}
    };
    this.client.resume();

    var gotEvent;
    this.client.on('altitudeChange', function(level) {
      assert.equal(level, fakeNavdata.demo.altitudeMeters);
      gotEvent = true;
    });

    this.fakeUdpNavdataStream.emit('data', fakeNavdata);
    assert.equal(gotEvent, true);
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

  'config(): sends config command 10 times': function() {
    this.client.resume();
    this.client.config('foo', 'bar');

    for (var i = 1; i <= 10; i++) {
      this.clock.tick(30);
      assert.equal(this.fakeUdpControl.config.callCount, i);
    }

    // Stop repeating after 10 intervals
    this.clock.tick(30);
    assert.equal(this.fakeUdpControl.config.callCount, 10);

    // Check that the arguments were right
    var args = this.fakeUdpControl.config.getCall(0).args;
    assert.equal(args.length, 2);
    assert.equal(args[0], 'foo');
    assert.equal(args[1], 'bar');
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

  'createPngStream resumes and returns internal pngStream': function() {
    // check that the PngStream was constructed properly
    assert.equal(Client.PngStream.callCount, 1);
    assert.strictEqual(Client.PngStream.getCall(0).args[0], this.options);

    sinon.stub(this.pngStream, 'resume');

    var pngStream = this.client.createPngStream();
    assert.equal(this.pngStream.resume.callCount, 1);
    assert.strictEqual(pngStream, this.pngStream);
  },

  'after methods are called in client context': function() {
    var after = sinon.spy();

    this.client.after(1000, after);

    this.clock.tick(1000);
    assert.equal(after.callCount, 1);
    assert.equal(after.getCall(0).thisValue, this.client);
  },

  'after enqueues methods to run after each other': function() {
    var after1 = sinon.spy();
    var after2 = sinon.spy();
    var after3 = sinon.spy();

    this.client
      .after(1000, after1)
      .after(2000, after2)
      .after(3000, after3);

    assert.equal(after1.callCount, 0);
    assert.equal(after2.callCount, 0);
    assert.equal(after3.callCount, 0);

    // Nothing should be triggered yet
    this.clock.tick(500);
    assert.equal(after1.callCount, 0);
    assert.equal(after2.callCount, 0);
    assert.equal(after3.callCount, 0);

    // First after callback should trigger
    this.clock.tick(500);
    assert.equal(after1.callCount, 1);
    assert.equal(after2.callCount, 0);
    assert.equal(after3.callCount, 0);

    // Second after callback should trigger
    this.clock.tick(2000);
    assert.equal(after1.callCount, 1);
    assert.equal(after2.callCount, 1);
    assert.equal(after3.callCount, 0);

    // Third after callback should trigger
    this.clock.tick(3000);
    assert.equal(after1.callCount, 1);
    assert.equal(after2.callCount, 1);
    assert.equal(after3.callCount, 1);
  },

  'disableEmergency sets emergency bit to true until navdata confirms': function() {
    // disable implicit disableEmergency for this test
    sinon.stub(this.client, 'disableEmergency');
    this.client.resume();
    this.client.disableEmergency.restore();

    // Initially emergency bit should be set to false
    var navdata = {droneState: {emergencyLanding: true}};
    this.fakeUdpNavdataStream.emit('data', navdata);
    assert.equal(this.client._ref.emergency, false);

    // But calling disableEmergency should flip it on
    this.client.disableEmergency();
    this.fakeUdpNavdataStream.emit('data', navdata);
    assert.equal(this.client._ref.emergency, true);

    // And make it stay on
    this.fakeUdpNavdataStream.emit('data', navdata);
    assert.equal(this.client._ref.emergency, true);

    // Until the emergencyLanding status goes to false
    navdata.droneState.emergencyLanding = false;
    this.fakeUdpNavdataStream.emit('data', navdata);
    assert.equal(this.client._ref.emergency, false);

    // But this should only happen once
    navdata.droneState.emergencyLanding = true;
    this.fakeUdpNavdataStream.emit('data', navdata);
    assert.equal(this.client._ref.emergency, false);
  },
});

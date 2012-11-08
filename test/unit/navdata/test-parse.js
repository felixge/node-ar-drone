var common = require('../../common');
var assert = require('assert');
var test = require('utest');
var sinon = require('sinon');
var parseNavdata = require(common.lib + '/navdata/parse');
var fs = require('fs');
var fixture = fs.readFileSync(common.fixtures + '/navdata.bin');

test('parse', {
  before: function() {
    this.clock = sinon.useFakeTimers();
  },

  after: function() {
    this.clock.restore();
  },

  'main payload': function() {
    var message = parseNavdata(fixture);

    assert.strictEqual(message.sequenceNumber, 300711);
    assert.strictEqual(message.visionFlag, 1);

    var status = message.status;
    assert.strictEqual(status.flying, 0);
    assert.strictEqual(status.videoEnabled, 0);
    assert.strictEqual(status.visionEnabled, 0);
    assert.strictEqual(status.controlAlgorithm, 0);
    assert.strictEqual(status.altitudeControlAlgorithm, 1);
    assert.strictEqual(status.startButtonState, 0);
    assert.strictEqual(status.controlCommandAck, 1);
    assert.strictEqual(status.cameraReady, 1);
    assert.strictEqual(status.travellingEnabled, 0);
    assert.strictEqual(status.usbReady, 0);
    assert.strictEqual(status.navdataDemo, 0);
    assert.strictEqual(status.navdataBootstrap, 0);
    assert.strictEqual(status.motorProblem, 0);
    assert.strictEqual(status.communicationLost, 0);
    assert.strictEqual(status.softwareFault, 0);
    assert.strictEqual(status.lowBattery, 0);
    assert.strictEqual(status.userEmergencyLanding, 0);
    assert.strictEqual(status.timerElapsed, 0);
    assert.strictEqual(status.magnometerNeedsCalibration, 0);
    assert.strictEqual(status.anglesOutOfRange, 0);
    assert.strictEqual(status.tooMuchWind, 0);
    assert.strictEqual(status.ultrasonicSensorDeaf, 0);
    assert.strictEqual(status.cutoutDetected, 0);
    assert.strictEqual(status.picVersionNumberOk, 1);
    assert.strictEqual(status.atCodecThreadOn, 1);
    assert.strictEqual(status.navdataThreadOn, 1);
    assert.strictEqual(status.videoThreadOn, 1);
    assert.strictEqual(status.acquisitionThreadOn, 1);
    assert.strictEqual(status.controlWatchdogDelay, 0);
    assert.strictEqual(status.adcWatchdogDelay, 0);
    assert.strictEqual(status.comWatchdogProblem, 1);
    assert.strictEqual(status.emergencyLanding, 0);

    assert.strictEqual(message.received.getTime(), Date.now());
  },

  'parses demo option': function() {
    var message = parseNavdata(fixture);
    assert.equal(message.flyState, 'ok');
    assert.equal(message.controlState, 'landed');
    assert.equal(message.batteryLevel, 0.5);
    assert.equal(message.altitude, 0);
    assert.equal(message.orientation.frontBack, 2.974);
    assert.equal(message.orientation.leftRight, 0.55);
    assert.equal(message.orientation.clockSpin, 1.933);
    assert.equal(message.speed.leftRight, 0.0585307739675045);
    assert.equal(message.speed.frontBack, -0.8817979097366333);
    assert.equal(message.speed.upDown, 0);
  },

  'parses wifi option': function() {
    var message = parseNavdata(fixture);
    assert.equal(message.wifiQuality, 1);
  },

  'parses time option': function() {
    var message = parseNavdata(fixture);
    assert.equal(message.time, 362979.125);
  },

  'throws exception on invalid header': function() {
    assert.throws(function() {
      parseNavdata(new Buffer([1, 2, 3, 4]));
    }, /header/i);
  },

  'detects bad checksum': function() {
    // hacky way to get a copy of our fixture
    var fixtureCopy = Buffer.concat([new Buffer(0), fixture]);

    // corrupt a byte inside our fixture
    fixtureCopy[23] = fixtureCopy[23] + 1;

    assert.throws(function() {
      parseNavdata(fixtureCopy)
    }, /checksum/i);
  },
});

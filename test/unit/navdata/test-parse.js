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

    assert.strictEqual(message.number, 300711);
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
    //console.log(message);
  },
});

var common       = require('../../common');
var assert       = require('assert');
var test         = require('utest');
var parseNavdata = require(common.lib + '/navdata/parseNavdata');
var fs           = require('fs');
var fixture      = fs.readFileSync(common.fixtures + '/navdata.bin');

test('parseNavdata', {
  'parses main payload': function() {
    var navdata = parseNavdata(fixture);

    assert.equal(navdata.header, parseNavdata.NAVDATA_HEADER);

    var droneState = navdata.droneState;
    assert.equal(droneState.flying, 0);
    assert.equal(droneState.videoEnabled, 0);
    assert.equal(droneState.visionEnabled, 0);
    assert.equal(droneState.controlAlgorithm, 0);
    assert.equal(droneState.altitudeControlAlgorithm, 1);
    assert.equal(droneState.startButtonState, 0);
    assert.equal(droneState.controlCommandAck, 1);
    assert.equal(droneState.cameraReady, 1);
    assert.equal(droneState.travellingEnabled, 0);
    assert.equal(droneState.usbReady, 0);
    assert.equal(droneState.navdataDemo, 0);
    assert.equal(droneState.navdataBootstrap, 0);
    assert.equal(droneState.motorProblem, 0);
    assert.equal(droneState.communicationLost, 0);
    assert.equal(droneState.softwareFault, 0);
    assert.equal(droneState.lowBattery, 0);
    assert.equal(droneState.userEmergencyLanding, 0);
    assert.equal(droneState.timerElapsed, 0);
    assert.equal(droneState.MagnometerNeedsCalibration, 0);
    assert.equal(droneState.anglesOutOfRange, 0);
    assert.equal(droneState.tooMuchWind, 0);
    assert.equal(droneState.ultrasonicSensorDeaf, 0);
    assert.equal(droneState.cutoutDetected, 0);
    assert.equal(droneState.picVersionNumberOk, 1);
    assert.equal(droneState.atCodecThreadOn, 1);
    assert.equal(droneState.navdataThreadOn, 1);
    assert.equal(droneState.videoThreadOn, 1);
    assert.equal(droneState.acquisitionThreadOn, 1);
    assert.equal(droneState.controlWatchdogDelay, 0);
    assert.equal(droneState.adcWatchdogDelay, 0);
    assert.equal(droneState.comWatchdogProblem, 1);
    assert.equal(droneState.emergencyLanding, 0);

    assert.equal(navdata.sequenceNumber, 300711);
    assert.equal(navdata.visionFlag, 1);
  },

  'parses demo option': function() {
    var demo = parseNavdata(fixture).demo;
    assert.equal(demo.flyState, 'FLYING_OK');
    assert.equal(demo.controlState, 'CTRL_LANDED');
    assert.equal(demo.batteryPercentage, 50);
    assert.equal(demo.rotation.frontBack, 2.974);
    assert.equal(demo.rotation.leftRight, 0.55);
    assert.equal(demo.rotation.clockwise, 1.933);
    assert.equal(demo.altitude, 0);
    assert.equal(demo.velocity.x, 0.0585307739675045);
    assert.equal(demo.velocity.y, -0.8817979097366333);
    assert.equal(demo.velocity.z, 0);
  },

  'parses wifi option': function() {
    var wifi = parseNavdata(fixture).wifi;
    assert.equal(wifi.linkQuality, 1);
  },

  'parses time option': function() {
    var time = parseNavdata(fixture).time;
    assert.equal(time, 362979.125);
  },

  'parses rawMeasures option': function() {
    var rawMeasures = parseNavdata(fixture).rawMeasures;

    assert.equal(rawMeasures.accelerometers.x, 2040);
    assert.equal(rawMeasures.accelerometers.y, 2036);
    assert.equal(rawMeasures.accelerometers.z, 2528);

    assert.equal(rawMeasures.gyroscopes.x, -23);
    assert.equal(rawMeasures.gyroscopes.y, 15);
    assert.equal(rawMeasures.gyroscopes.z, 0);

    assert.equal(rawMeasures.gyroscopes110.x, 0);
    assert.equal(rawMeasures.gyroscopes110.y, 0);

    assert.equal(rawMeasures.batteryMilliVolt, 11686);
    assert.equal(rawMeasures.us.echo.start, 0);
    assert.equal(rawMeasures.us.echo.end, 0);
    assert.equal(rawMeasures.us.echo.association, 3758);
    assert.equal(rawMeasures.us.echo.distance, 0);
    assert.equal(rawMeasures.us.curve.time, 21423);
    assert.equal(rawMeasures.us.curve.value, 0);
    assert.equal(rawMeasures.us.curve.ref, 120);
    assert.equal(rawMeasures.echo.flagIni, 1);
    assert.equal(rawMeasures.echo.num, 1);
    assert.equal(rawMeasures.echo.sum, 3539193);
    assert.equal(rawMeasures.altTempRaw, 243);
  },

  'parses pwm option': function() {
    var pwm = parseNavdata(fixture).pwm;

    assert.deepEqual(pwm.motors, [0, 0, 0, 0]);
    assert.deepEqual(pwm.satMotors, [255, 255, 255, 255]);
    assert.equal(pwm.gazFeedForward, 0);
    assert.equal(pwm.gazAltitude, 0);
    assert.equal(pwm.altitudeIntegral, 0);
    assert.equal(pwm.vzRef, 0);
    assert.equal(pwm.uPitch, 0);
    assert.equal(pwm.uRoll, 0);
    assert.equal(pwm.uYaw, 0);
    assert.equal(pwm.yawUI, 0);
    assert.equal(pwm.uPitchPlanif, 0);
    assert.equal(pwm.uRollPlanif, 0);
    assert.equal(pwm.uYawPlanif, 0);
    assert.equal(pwm.uGazPlanif, 0);
    assert.deepEqual(pwm.motorCurrents, [0, 0, 0, 0]);
    assert.equal(pwm.altitudeProp, 0);
    assert.equal(pwm.altitudeDer, 0);
  },

  'parses watchdog option': function() {
    var watchdog = parseNavdata(fixture).watchdog;
    assert.equal(watchdog, 4822);
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

  'no infinite loop when checksum is cut off': function() {
    var incompleteFixture = Buffer.concat([
      new Buffer(0),
      fixture.slice(0, fixture.length - 8) // strip checksum from end
    ]);

    assert.throws(function() {
      parseNavdata(incompleteFixture)
    }, /beyond/i);
  },
});

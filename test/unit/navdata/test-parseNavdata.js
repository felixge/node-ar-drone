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

    assert.equal(demo.frontBackDegrees, 2.974);
    assert.equal(demo.leftRightDegrees, 0.55);
    assert.equal(demo.clockwiseDegrees, 1.933);

    assert.equal(demo.rotation.frontBack, 2.974);
    assert.equal(demo.rotation.leftRight, 0.55);
    assert.equal(demo.rotation.clockwise, 1.933);

    assert.equal(demo.rotation.pitch, 2.974);
    assert.equal(demo.rotation.roll, 0.55);
    assert.equal(demo.rotation.yaw, 1.933);

    assert.equal(demo.rotation.theta, 2.974);
    assert.equal(demo.rotation.phi, 0.55);
    assert.equal(demo.rotation.psi, 1.933);

    assert.equal(demo.rotation.y, 2.974);
    assert.equal(demo.rotation.x, 0.55);
    assert.equal(demo.rotation.z, 1.933);

    assert.equal(demo.altitudeMeters, 0);
    assert.equal(demo.altitude, 0);

    assert.equal(demo.xVelocity, 0.0585307739675045);
    assert.equal(demo.yVelocity, -0.8817979097366333);
    assert.equal(demo.zVelocity, 0);
    assert.equal(demo.velocity.x, 0.0585307739675045);
    assert.equal(demo.velocity.y, -0.8817979097366333);
    assert.equal(demo.velocity.z, 0);
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

    assert.equal(rawMeasures.gyrometers.x, -23);
    assert.equal(rawMeasures.gyrometers.y, 15);
    assert.equal(rawMeasures.gyrometers.z, 0);
    assert.equal(rawMeasures.gyroscopes.x, -23);
    assert.equal(rawMeasures.gyroscopes.y, 15);
    assert.equal(rawMeasures.gyroscopes.z, 0);

    assert.equal(rawMeasures.gyrometers110[0], 0);
    assert.equal(rawMeasures.gyrometers110[1], 0);
    assert.equal(rawMeasures.gyrometers110.length, 2);
    assert.equal(rawMeasures.gyroscopes110.x, 0);
    assert.equal(rawMeasures.gyroscopes110.y, 0);

    assert.equal(rawMeasures.batteryMilliVolt, 11686);

    assert.equal(rawMeasures.usDebutEcho, 0);
    assert.equal(rawMeasures.usFinEcho, 0);
    assert.equal(rawMeasures.usAssociationEcho, 3758);
    assert.equal(rawMeasures.usDistanceEcho, 0);
    assert.equal(rawMeasures.us.echo.start, 0);
    assert.equal(rawMeasures.us.echo.end, 0);
    assert.equal(rawMeasures.us.echo.association, 3758);
    assert.equal(rawMeasures.us.echo.distance, 0);

    assert.equal(rawMeasures.usCourbeTemps, 21423);
    assert.equal(rawMeasures.usCourbeValeur, 0);
    assert.equal(rawMeasures.usCourbeRef, 120);
    assert.equal(rawMeasures.us.curve.time, 21423);
    assert.equal(rawMeasures.us.curve.value, 0);
    assert.equal(rawMeasures.us.curve.ref, 120);


    assert.equal(rawMeasures.flagEchoIni, 1);
    assert.equal(rawMeasures.nbEcho, 1);
    assert.equal(rawMeasures.sumEcho, 3539193);
    assert.equal(rawMeasures.echo.flagIni, 1);
    assert.equal(rawMeasures.echo.num, 1);
    assert.equal(rawMeasures.echo.sum, 3539193);

    assert.equal(rawMeasures.altTempRaw, 243);
    assert.equal(rawMeasures.altTemp, 243);
  },

  'parses physMeasures option': function() {
    var actual   = parseNavdata(fixture).physMeasures;
    var expected = {
        temperature : {
            accelerometer : 45.309303283691406,
            gyroscope     : 55738
        },
        accelerometers : {
            x : 80.2970962524414,
            y : -33.318603515625,
            z : -942.5283203125
        },
        gyroscopes : {
            x : -0.11236488074064255,
            y : 0.06872134655714035,
            z : 0.06200997903943062
        },
        alim3V3   : 0,
        vrefEpson : 0,
        vrefIDG   : 0
    };
    assert.equal(actual.temperature.accelerometer, expected.temperature.accelerometer);
    assert.equal(actual.temperature.gyroscope, expected.temperature.gyroscope);
    assert.equal(actual.accelerometers.x, expected.accelerometers.x);
    assert.equal(actual.accelerometers.y, expected.accelerometers.y);
    assert.equal(actual.accelerometers.z, expected.accelerometers.z);
    assert.equal(actual.gyroscopes.x, expected.gyroscopes.x);
    assert.equal(actual.gyroscopes.y, expected.gyroscopes.y);
    assert.equal(actual.gyroscopes.z, expected.gyroscopes.z);
    assert.equal(actual.alim3V3, expected.alim3V3);
    assert.equal(actual.vrefEpson, expected.vrefEpson);
    assert.equal(actual.vrefIDG, expected.vrefIDG);
  },

  'parses gyrosOffsets option': function() {
    var actual   = parseNavdata(fixture).gyrosOffsets;
    var expected = {
        x : -0.5329172611236572,
        y : 0.1788240224123001,
        z : 0
    };

    assert.equal(actual.x, expected.x);
    assert.equal(actual.y, expected.y);
    assert.equal(actual.z, expected.z);
  },

  'parses eulerAngles option': function() {
    var actual   = parseNavdata(fixture).eulerAngles;
    var expected = {
        theta : 4866,
        phi   : 2024
    };

    assert.equal(actual.theta, expected.theta);
    assert.equal(actual.phi, expected.phi);
  },

  'parses references option': function() {
    var actual   = parseNavdata(fixture).references;
    var expected = {
        theta    : 0,
        phi      : 0,
        thetaI   : 0,
        phiI     : 0,
        pitch    : 0,
        roll     : 0,
        yaw      : 0,
        psi      : 0,
        vx       : 0,
        vy       : 0,
        thetaMod : 0,
        phiMod   : 0,
        kVX      : 0,
        kVY      : 0,
        kMode    : 0,
        ui       : {
            time        : 0,
            theta       : 0,
            phi         : 0,
            psi         : 0,
            psiAccuracy : 0,
            seq         : 0
        }
    };

    assert.equal(actual.theta, expected.theta);
    assert.equal(actual.phi, expected.phi);
    assert.equal(actual.thetaI, expected.thetaI);
    assert.equal(actual.phiI, expected.phiI);
    assert.equal(actual.pitch, expected.pitch);
    assert.equal(actual.roll, expected.roll);
    assert.equal(actual.yaw, expected.yaw);
    assert.equal(actual.psi, expected.psi);
    assert.equal(actual.vx, expected.vx);
    assert.equal(actual.vy, expected.vy);
    assert.equal(actual.thetaMod, expected.thetaMod);
    assert.equal(actual.phiMod, expected.phiMod);
    assert.equal(actual.kVX, expected.kVX);
    assert.equal(actual.kVY, expected.kVY);
    assert.equal(actual.kMode, expected.kMode);
    assert.equal(actual.ui.time, expected.ui.time);
    assert.equal(actual.ui.theta, expected.ui.theta);
    assert.equal(actual.ui.phi, expected.ui.phi);
    assert.equal(actual.ui.psi, expected.ui.psi);
    assert.equal(actual.ui.psiAccuracy, expected.ui.psiAccuracy);
    assert.equal(actual.ui.seq, expected.ui.seq);
  },

  'parses trims option': function() {
    var actual   = parseNavdata(fixture).trims;
    var expected = {
        angularRates : {
            r : 0
        },
        eulerAngles : {
            theta : 3028.916015625,
            phi   : 1544.318359375
        }
    };

    assert.equal(actual.angularRates.r, expected.angularRates.r);
    assert.equal(actual.eulerAngles.theta, expected.eulerAngles.theta);
    assert.equal(actual.eulerAngles.phi, expected.eulerAngles.phi);
  },

  'parses rcReferences option': function() {
    var actual   = parseNavdata(fixture).rcReferences;
    var expected = {
        pitch : 0,
        roll  : 0,
        yaw   : 0,
        gaz   : 0,
        ag    : 0
    };

    assert.equal(actual.pitch, expected.pitch);
    assert.equal(actual.roll, expected.roll);
    assert.equal(actual.yaw, expected.yaw);
    assert.equal(actual.gaz, expected.gaz);
    assert.equal(actual.ag, expected.ag);
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

  'parses altitude option': function() {
    var actual   = parseNavdata(fixture).altitude;
    var expected = {
        vision   : 243,
        velocity : 0,
        ref      : 0,
        raw      : 243,
        observer : {
            acceleration: 0,
            altitude: 0,
            x: {
                x: 0,
                y: 0,
                z: 0
            },
            state: 0
        },
        estimated: {
            vb: {
                x: 0,
                y: 0
            },
            state: 0
        }
    };

    assert.equal(actual.vision, expected.vision);
    assert.equal(actual.velocity, expected.velocity);
    assert.equal(actual.ref, expected.ref);
    assert.equal(actual.raw, expected.raw);
    assert.equal(actual.observer.acceleration, expected.observer.acceleration);
    assert.equal(actual.observer.altitude, expected.observer.altitude);
    assert.equal(actual.observer.x.x, expected.observer.x.x);
    assert.equal(actual.observer.x.y, expected.observer.x.y);
    assert.equal(actual.observer.x.z, expected.observer.x.z);
    assert.equal(actual.observer.state, expected.observer.state);
    assert.equal(actual.estimated.vb.x, expected.estimated.vb.x);
    assert.equal(actual.estimated.vb.y, expected.estimated.vb.y);
    assert.equal(actual.estimated.state, expected.estimated.state);
  },

  'parses visionRaw option': function() {
    var actual   = parseNavdata(fixture).visionRaw;
    var expected = {
        tx: 1.3266397714614868,
        ty: -0.7230937480926514,
        tz: 0
    };

    assert.equal(actual.tx, expected.tx);
    assert.equal(actual.ty, expected.ty);
    assert.equal(actual.tz, expected.tz);
  },

  'parses visionOf option': function() {
    var actual   = parseNavdata(fixture).visionOf;
    var expected = {
        dx: [0, 0, 0, 0, 0],
        dy: [0, 0, 0, 0, 0]
    };

    assert.deepEqual(actual.dx, expected.dx);
    assert.deepEqual(actual.dy, expected.dy);
  },

  // 'parses option': function() {
  //   var actual   = parseNavdata(fixture).;
  //   var expected = ;
  //
  //   assert.equal(actual)
  // },

  // 'parses option': function() {
  //   var actual   = parseNavdata(fixture).;
  //   var expected = ;
  //
  //   assert.equal(actual)
  // },

  // 'parses option': function() {
  //   var actual   = parseNavdata(fixture).;
  //   var expected = ;
  //
  //   assert.equal(actual)
  // },

  // 'parses option': function() {
  //   var actual   = parseNavdata(fixture).;
  //   var expected = ;
  //
  //   assert.equal(actual)
  // },

  'parses watchdog option': function() {
    var watchdog = parseNavdata(fixture).watchdog;
    assert.equal(watchdog, 4822);
  },

  // 'parses option': function() {
  //   var actual   = parseNavdata(fixture).;
  //   var expected = ;
  //
  //   assert.equal(actual)
  // },

  // 'parses option': function() {
  //   var actual   = parseNavdata(fixture).;
  //   var expected = ;
  //
  //   assert.equal(actual)
  // },

  // 'parses option': function() {
  //   var actual   = parseNavdata(fixture).;
  //   var expected = ;
  //
  //   assert.equal(actual)
  // },

  // 'parses option': function() {
  //   var actual   = parseNavdata(fixture).;
  //   var expected = ;
  //
  //   assert.equal(actual)
  // },

  // 'parses option': function() {
  //   var actual   = parseNavdata(fixture).;
  //   var expected = ;
  //
  //   assert.equal(actual)
  // },

  // 'parses option': function() {
  //   var actual   = parseNavdata(fixture).;
  //   var expected = ;
  //
  //   assert.equal(actual)
  // },

  // 'parses option': function() {
  //   var actual   = parseNavdata(fixture).;
  //   var expected = ;
  //
  //   assert.equal(actual)
  // },

  // 'parses option': function() {
  //   var actual   = parseNavdata(fixture).;
  //   var expected = ;
  //
  //   assert.equal(actual)
  // },

  'parses wifi option': function() {
    var wifi = parseNavdata(fixture).wifi;
    assert.equal(wifi.linkQuality, 1);
  },

  // 'parses option': function() {
  //   var actual   = parseNavdata(fixture).;
  //   var expected = ;
  //
  //   assert.equal(actual)
  // },

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

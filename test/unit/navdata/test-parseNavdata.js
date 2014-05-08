var common       = require('../../common');
var assert       = require('assert');
var test         = require('utest');
var parseNavdata = require(common.lib + '/navdata/parseNavdata');
var fs           = require('fs');
var fixture      = fs.readFileSync(common.fixtures + '/navdata.bin');

test('parseNavdata', {
  'parses main payload': function() {
    var navdata = parseNavdata(fixture);

    assert(navdata.header === parseNavdata.NAVDATA_HEADER1 ||
           navdata.header === parseNavdata.NAVDATA_HEADER2);

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

  'parses vision option': function() {
    var actual   = parseNavdata(fixture).vision;
    var expected = {
      state: 2,
      misc: 0,
      phi: {
        trim: 0,
        refProp: 0
      },
      theta: {
        trim: 0,
        refProp: 0
      },
      newRawPicture: 0,
      capture: {
        theta: 0.05190306529402733,
        phi: 0.009620788507163525,
        psi: 0.033727407455444336,
        altitude: 243,
        time: 362.969
      },
      bodyV: {
        x: 0.05845191329717636,
        y: -0.8817280530929565,
        z: 0.011505687609314919
      },
      delta: {
        phi: 0,
        theta: 0,
        psi: 0
      },
      gold: {
        defined: 0,
        reset: 0,
        x: 0,
        y: 0
      }
    };

    assert.equal(actual.state, expected.state);
    assert.equal(actual.misc, expected.misc);
    assert.deepEqual(actual.phi, expected.phi);
    assert.deepEqual(actual.theta, expected.theta);
    assert.equal(actual.newRawPicture, expected.newRawPicture);
    assert.deepEqual(actual.capture, expected.capture);
    assert.deepEqual(actual.bodyV, expected.bodyV);
    assert.deepEqual(actual.delta, expected.delta);
    assert.deepEqual(actual.gold, expected.gold);
  },

  'parses visionPerf option': function() {
    var actual   = parseNavdata(fixture).visionPerf;
    var expected = {
      szo: 0,
      corners: 0,
      compute: 0,
      tracking: 0,
      trans: 0,
      update: 0,
      custom: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    };

    assert.equal(actual.szo, expected.szo);
    assert.equal(actual.corners, expected.corners);
    assert.equal(actual.compute, expected.compute);
    assert.equal(actual.tracking, expected.tracking);
    assert.equal(actual.trans, expected.trans);
    assert.equal(actual.update, expected.update);
    assert.deepEqual(actual.custom, expected.custom);
  },

  'parses trackersSend option': function() {
    var actual   = parseNavdata(fixture).trackersSend;
    var expected = {
      locked: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
      point: [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 }
      ]
    };

    assert.deepEqual(actual.locked, expected.locked);
    assert.deepEqual(actual.point, expected.point);
  },

  'parses visionDetect option': function() {
    var actual   = parseNavdata(fixture).visionDetect;
    var expected = {
      nbDetected: 0,
      type: [0, 0, 0, 0],
      xc: [0, 0, 0, 0],
      yc: [0, 0, 0, 0],
      width: [0, 0, 0, 0],
      height: [0, 0, 0, 0],
      dist: [0, 0, 0, 0],
      orientationAngle: [0, 0, 0, 0],
      rotation: [{
        m11: 0,
        m12: 0,
        m13: 0,
        m21: 0,
        m22: 0,
        m23: 0,
        m31: 0,
        m32: 0,
        m33: 0
      }, {
        m11: 0,
        m12: 0,
        m13: 0,
        m21: 0,
        m22: 0,
        m23: 0,
        m31: 0,
        m32: 0,
        m33: 0
      }, {
        m11: 0,
        m12: 0,
        m13: 0,
        m21: 0,
        m22: 0,
        m23: 0,
        m31: 0,
        m32: 0,
        m33: 0
      }, {
        m11: 0,
        m12: 0,
        m13: 0,
        m21: 0,
        m22: 0,
        m23: 0,
        m31: 0,
        m32: 0,
        m33: 0
      }],
      translation: [{
        x: 0,
        y: 0,
        z: 0
      }, {
        x: 0,
        y: 0,
        z: 0
      }, {
        x: 0,
        y: 0,
        z: 0
      }, {
        x: 0,
        y: 0,
        z: 0
      }],
      cameraSource: [0, 0, 0, 0]
    };

    assert.equal(actual.nbDetected, expected.nbDetected);
    assert.deepEqual(actual.type, expected.type);
    assert.deepEqual(actual.xc, expected.xc);
    assert.deepEqual(actual.yc, expected.yc);
    assert.deepEqual(actual.width, expected.width);
    assert.deepEqual(actual.height, expected.height);
    assert.deepEqual(actual.dist, expected.dist);
    assert.deepEqual(actual.orientationAngle, expected.orientationAngle);
    assert.deepEqual(actual.rotation, expected.rotation);
    assert.deepEqual(actual.translation, expected.translation);
    assert.deepEqual(actual.cameraSource, expected.cameraSource);
  },

  'parses watchdog option': function() {
    var watchdog = parseNavdata(fixture).watchdog;
    assert.equal(watchdog, 4822);
  },

  'parses adcDataFrame option': function() {
    var actual   = parseNavdata(fixture).adcDataFrame;
    var expected = {
      version: 0,
      dataFrame: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
    };

    assert.equal(actual.version, expected.version);
    assert.deepEqual(actual.dataFrame, expected.dataFrame);
  },

  'parses videoStream option': function() {
    var actual   = parseNavdata(fixture).videoStream;
    var expected = {
      quant: 0,
      frame: {
        size: 4597,
        number: 46105
      },
      atcmd: {
        sequence: 0,
        meanGap: 0,
        varGap: 0,
        quality: 0
      },
      bitrate: {
        out: 0,
        desired: 0
      },
      data: [0, 0, 0, 0, 0],
      tcpQueueLevel: 0,
      fifoQueueLevel: 0
    };

    assert.equal(actual.quant, expected.quant);
    assert.deepEqual(actual.frame, expected.frame);
    assert.deepEqual(actual.atcmd, expected.atcmd);
    assert.deepEqual(actual.bitrate, expected.bitrate);
    assert.deepEqual(actual.data, expected.data);
    assert.equal(actual.tcpQueueLevel, expected.tcpQueueLevel);
    assert.equal(actual.fifoQueueLevel, expected.fifoQueueLevel);
  },

  'parses games option': function() {
    var actual   = parseNavdata(fixture).games;
    var expected = {
      counters: {
        doubleTap: 0,
        finishLine: 0
      }
    };

    assert.equal(actual.counters.doubleTap, expected.counters.doubleTap);
    assert.equal(actual.counters.finishLine, expected.counters.finishLine);
  },

  'parses pressureRaw option': function() {
    var actual   = parseNavdata(fixture).pressureRaw;
    var expected = {
      up: 39148,
      ut: 32556,
      temperature: 435,
      pressure: 101586
    };

    assert.equal(actual.up, expected.up);
    assert.equal(actual.ut, expected.ut);
    assert.equal(actual.temperature, expected.temperature);
    assert.equal(actual.pressure, expected.pressure);
  },

  'parses magneto option': function() {
    var actual   = parseNavdata(fixture).magneto;
    var expected = {
      mx: 30,
      my: -56,
      mz: 80,
      raw: {
        x: 189,
        y: -100.8984375,
        z: -278.4375
      },
      rectified: {
        x: 145.08058166503906,
        y: -84.93736267089844,
        z: -287.18157958984375
      },
      offset: {
        x: 29.21237564086914,
        y: -13.282999038696289,
        z: 0
      },
      heading: {
        unwrapped: 0,
        gyroUnwrapped: 0.00041322660399600863,
        fusionUnwrapped: 1.933355689048767
      },
      ok: 1,
      state: 2,
      radius: 387.31146240234375,
      error: {
        mean: -211.51361083984375,
        variance: 79.3671875
      }
    };

    assert.equal(actual.mx, expected.mx);
    assert.equal(actual.my, expected.my);
    assert.deepEqual(actual.raw, expected.raw);
    assert.deepEqual(actual.rectified, expected.rectified);
    assert.deepEqual(actual.offset, expected.offset);
    assert.deepEqual(actual.heading, expected.heading);
    assert.equal(actual.mz, expected.mz);
    assert.equal(actual.ok, expected.ok);
    assert.equal(actual.state, expected.state);
    assert.equal(actual.radius, expected.radius);
    assert.deepEqual(actual.error, expected.error);
  },

  'parses windSpeed option': function() {
    var actual   = parseNavdata(fixture).windSpeed;
    var expected = {
      speed: 0,
      angle: 0,
      compensation: {
        theta: 0,
        phi: 0
      },
      stateX: [0.05845191329717636, -0.8817280530929565, 0, 0, 305.5962829589844, -236.80516052246094],
      debug: [0, 0, 0]
    };

    assert.equal(actual.speed, expected.speed);
    assert.equal(actual.angle, expected.angle);
    assert.deepEqual(actual.compensation, expected.compensation);
    assert.deepEqual(actual.stateX, expected.stateX);
    assert.deepEqual(actual.debug, expected.debug);
  },

  'parses kalmanPressure option': function() {
    var actual   = parseNavdata(fixture).kalmanPressure;
    var expected = {
      offsetPressure: 101580,
      estimated: {
        altitude: 0,
        velocity: 0,
        angle: {
          pwm: 0,
          pressure: 0
        },
        us: {
          offset: 0,
          prediction: 0
        },
        covariance: {
          alt: 0.0005193915567360818,
          pwm: 0.6806257367134094,
          velocity: 0.025059189647436142
        },
        groundEffect: true,
        sum: 0,
        reject: false,
        uMultisinus: 0,
        gazAltitude: 0,
        flagMultisinus: false,
        flagMultisinusStart: false
      }
    };

    assert.equal(actual.offsetPressure, expected.offsetPressure);
    assert.equal(actual.estimated.altitude, expected.estimated.altitude);
    assert.equal(actual.estimated.velocity, expected.estimated.velocity);
    assert.deepEqual(actual.estimated.angle, expected.estimated.angle);
    assert.deepEqual(actual.estimated.us, expected.estimated.us);
    assert.deepEqual(actual.estimated.covariance, expected.estimated.covariance);
    assert.equal(actual.estimated.groundEffect, expected.estimated.groundEffect);
    assert.equal(actual.estimated.sum, expected.estimated.sum);
    assert.equal(actual.estimated.reject, expected.estimated.reject);
    assert.equal(actual.estimated.uMultisinus, expected.estimated.uMultisinus);
    assert.equal(actual.estimated.gazAltitude, expected.estimated.gazAltitude);
    assert.equal(actual.estimated.flagMultisinus, expected.estimated.flagMultisinus);
    assert.equal(actual.estimated.flagMultisinusStart, expected.estimated.flagMultisinusStart);
  },

  'parses hdvideoStream option': function() {
    var actual   = parseNavdata(fixture).hdvideoStream;
    var expected = {
      hdvideoState: 0,
      storageFifo: {
        nbPackets: 0,
        size: 0
      },
      usbkey: {
        size: 0,
        freespace: 0,
        remainingTime: 0
      },
      frameNumber: 0
    };

    assert.equal(actual.hdvideoState, expected.hdvideoState);
    assert.deepEqual(actual.storageFifo, expected.storageFifo);
    assert.deepEqual(actual.usbkey, expected.usbkey);
    assert.equal(actual.frameNumber, expected.frameNumber);
  },

  'parses wifi option': function() {
    var wifi = parseNavdata(fixture).wifi;
    assert.equal(wifi.linkQuality, 1);
  },

  'parses gps option': function() {
    var gps = parseNavdata(fixture).gps;
    assert.equal(gps.latitude, 34.0905016);
    assert.equal(gps.longitude, -118.2766877);
    assert.equal(gps.elevation, 122.64);
    assert.equal(gps.hdop, 1);
    assert.equal(gps.dataAvailable, 7);
    assert.equal(gps.zeroValidated, 1);
    assert.equal(gps.wptValidated, 0);
    assert.equal(gps.lat0, 34.0905016);
    assert.equal(gps.lon0, -118.2766877);
    assert.equal(gps.latFuse, 34.0904833);
    assert.equal(gps.lonFuse, -118.2766982);
    assert.equal(gps.gpsState, 1);
    assert.equal(gps.xTraj, 0);
    assert.equal(gps.xRef, 0);
    assert.equal(gps.yTraj, 0);
    assert.equal(gps.yRef, 0);
    assert.equal(gps.thetaP, 0);
    assert.equal(gps.phiP, 0);
    assert.equal(gps.thetaD, 0);
    assert.equal(gps.phiD, 0);
    assert.equal(gps.vdop, 0);
    assert.equal(gps.pdop, 0);
    assert.equal(gps.speed, 0.10000000149011612);
    assert.equal(gps.lastFrameTimestamp, 2409.591);
    assert.equal(gps.degree, 141.00999450683594);
    assert.equal(gps.degreeMag, 0);
    assert.equal(gps.ehpe, 8.260000228881836);
    assert.equal(gps.ehve, 0.429999977350235);
    assert.equal(gps.c_n0, 28);
    assert.equal(gps.nbSatellites, 9);
    assert.deepEqual(
      gps.channels,
      [ { sat: 10, cn0: 26 },
        { sat: 5, cn0: 21 },
        { sat: 8, cn0: 27 },
        { sat: 3, cn0: 17 },
        { sat: 13, cn0: 18 },
        { sat: 7, cn0: 32 },
        { sat: 9, cn0: 23 },
        { sat: 27, cn0: 9 },
        { sat: 19, cn0: 19 },
        { sat: 28, cn0: 29 },
        { sat: 30, cn0: 26 },
        { sat: 138, cn0: 0 } ]);
    assert.equal(gps.gpsPlugged, 1);
    assert.equal(gps.ephemerisStatus, 73);
    assert.equal(gps.vxTraj, 0);
    assert.equal(gps.vyTraj, 0);
    assert.equal(gps.firmwareStatus, 1);
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
      parseNavdata(fixtureCopy);
    }, /checksum/i);
  },

  'no infinite loop when checksum is cut off': function() {
    var incompleteFixture = Buffer.concat([
      new Buffer(0),
      fixture.slice(0, fixture.length - 8) // strip checksum from end
    ]);

    assert.throws(function() {
      parseNavdata(incompleteFixture);
    }, /beyond/i);
  },
});

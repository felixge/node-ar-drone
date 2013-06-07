var NavdataReader = require('./NavdataReader');

// call `iterator` `n` times, returning an array of the results
var timesMap = function(n, iterator, context) {
  var results = [];
  for (var i = 0; i < n; i++) results[i] = iterator.call(context, i);
  return results;
};

var droneTimeToMilliSeconds = function (time) {
  // first 11 bits are seconds
  var seconds = time >> 21;
  // last 21 bits are microseconds
  var microseconds = (time << 11) >> 11;

  // Convert to ms (which is idiomatic for time in JS)
  return seconds * 1000 + microseconds / 1000;
};

var exports = module.exports = function parseNavdata(buffer) {
  var reader = new NavdataReader(buffer);

  var navdata = {};

  navdata.header = reader.uint32();
  if (navdata.header !== exports.NAVDATA_HEADER) {
    throw new Error('Invalid header: 0x' + navdata.header.toString(16));
  }

  navdata.droneState     = reader.mask32(exports.DRONE_STATES);
  navdata.sequenceNumber = reader.uint32();
  navdata.visionFlag     = reader.uint32();

  while (true) {
    var optionId   = reader.uint16();
    var optionName = exports.OPTION_IDS[optionId];
    var length     = reader.uint16();

    // length includes header size (4 bytes)
    var optionReader = new NavdataReader(reader.buffer(length - 4));

    if (optionName == 'checksum') {
      var expectedChecksum = 0;
      for (var i = 0; i < buffer.length - length; i++) {
        expectedChecksum += buffer[i];
      }

      var checksum = optionReader.uint32();

      if (checksum !== expectedChecksum) {
        throw new Error('Invalid checksum, expected: ' + expectedChecksum + ', got: ' + checksum);
      }

      // checksum is the last option
      break;
    }

    // parse option according to  ARDrone_SDK_2_0/ARDroneLib/Soft/Common/navdata_common.h)
    navdata[optionName] = (exports.OPTION_PARSERS[optionName])
      ? exports.OPTION_PARSERS[optionName](optionReader)
      : new Error('Option not implemented yet: ' + optionName + ' (0x' + optionId.toString(16) + ')');
  }

  return navdata;
};

exports.OPTION_PARSERS = {
  'demo': function(reader) {
    // simplified version of ctrl_state_str (in ARDrone_SDK_2_0/Examples/Linux/Navigation/Sources/navdata_client/navdata_ihm.c)
    var flyState          = exports.FLY_STATES[reader.uint16()];
    var controlState      = exports.CONTROL_STATES[reader.uint16()];
    var batteryPercentage = reader.uint32();
    var theta             = reader.float32() / 1000; // [mdeg]
    var phi               = reader.float32() / 1000; // [mdeg]
    var psi               = reader.float32() / 1000; // [mdeg]
    var altitude          = reader.int32()   / 1000; // [mm]
    var velocity          = reader.vector31(); // [mm/s]
    var frameIndex = reader.uint32();
    var detection = {
      camera: {
        rotation    : reader.matrix33(),
        translation : reader.vector31()
      },
      tagIndex: reader.uint32()
    };
    detection.camera.type = reader.uint32();
    var drone = {
      camera: {
        rotation    : reader.matrix33(),
        translation : reader.vector31()
      }
    };
    var rotation = {
      frontBack : theta,
      pitch     : theta,
      theta     : theta,
      y         : theta,
      leftRight : phi,
      roll      : phi,
      phi       : phi,
      x         : phi,
      clockwise : psi,
      yaw       : psi,
      psi       : psi,
      z         : psi
    };

    return {
      controlState      : controlState,
      flyState          : flyState,
      batteryPercentage : batteryPercentage,
      rotation          : rotation,
      frontBackDegrees  : theta,
      leftRightDegrees  : phi,
      clockwiseDegrees  : psi,
      altitude          : altitude,
      altitudeMeters    : altitude,
      velocity          : velocity,
      xVelocity         : velocity.x,
      yVelocity         : velocity.y,
      zVelocity         : velocity.z,
      frameIndex        : frameIndex,
      detection         : detection,
      drone             : drone
    };
  },

  'time': function(reader) {
    var time = reader.uint32();
    return droneTimeToMilliSeconds(time);
  },

  'rawMeasures': function(reader) {
    var accelerometers = {
      x: reader.uint16(), // [LSB]
      y: reader.uint16(), // [LSB]
      z: reader.uint16()  // [LSB]
    };
    var gyroscopes = {
      x: reader.int16(), // [LSB]
      y: reader.int16(), // [LSB]
      z: reader.int16()  // [LSB]
    };
    // gyroscopes  x/y 110 deg/s (@TODO figure out what that means)
    var gyroscopes110 = {
      x: reader.int16(), // [LSB]
      y: reader.int16()  // [LSB]
    };
    var batteryMilliVolt = reader.uint32(); // [mV]
    // no idea what any of those are
    var usEcho = {
      start       : reader.uint16(), // [LSB]
      end         : reader.uint16(), // [LSB]
      association : reader.uint16(), // [LSB?]
      distance    : reader.uint16()  // [LSB]
    };
    var usCurve = {
      time  : reader.uint16(), // [LSB]
      value : reader.uint16(), // [LSB]
      ref   : reader.uint16()  // [LSB]
    };
    var echo = {
      flagIni : reader.uint16(), // [LSB]
      num     : reader.uint16(), // [LSB] (is key `num` OR `name`?)
      sum     : reader.uint32()  // [LSB]
    };
    var altTemp  = reader.int32(); // [mm]

    return {
      accelerometers    : accelerometers,
      gyroscopes        : gyroscopes,
      gyrometers        : gyroscopes,
      gyroscopes110     : gyroscopes110,
      gyrometers110     : [gyroscopes110.x, gyroscopes110.y],
      batteryMilliVolt  : batteryMilliVolt,
      us                : {echo: usEcho, curve: usCurve},
      usDebutEcho       : usEcho.start,
      usFinEcho         : usEcho.end,
      usAssociationEcho : usEcho.association,
      usDistanceEcho    : usEcho.distance,
      usCourbeTemps     : usCurve.time,
      usCourbeValeur    : usCurve.value,
      usCourbeRef       : usCurve.ref,
      echo              : echo,
      flagEchoIni       : echo.flagIni,
      nbEcho            : echo.num,
      sumEcho           : echo.sum,
      altTemp           : altTemp,
      altTempRaw        : altTemp
    };
  },

  'physMeasures': function(reader) {
    return {
      temperature: {
        accelerometer: reader.float32(), // [K]
        gyroscope: reader.uint16()  // [LSB]
      },
      accelerometers : reader.vector31(), // [mg]
      gyroscopes     : reader.vector31(), // [deg/s]
      alim3V3        : reader.uint32(), // [LSB]
      vrefEpson      : reader.uint32(), // [LSB]
      vrefIDG        : reader.uint32()  // [LSB]
    };
  },

  'gyrosOffsets': function(reader) {
    return reader.vector31();  // [LSB]
  },

  'eulerAngles': function(reader) {
    return {
      theta : reader.float32(), // [mdeg?]
      phi   : reader.float32()  // [mdeg?]
    };
  },

  'references': function(reader) {
    return {
      theta    : reader.int32(), // [mdeg]
      phi      : reader.int32(), // [mdeg]
      thetaI   : reader.int32(), // [mdeg]
      phiI     : reader.int32(), // [mdeg]
      pitch    : reader.int32(), // [mdeg]
      roll     : reader.int32(), // [mdeg]
      yaw      : reader.int32(), // [mdeg/s]
      psi      : reader.int32(), // [mdeg]

      vx       : reader.float32(),
      vy       : reader.float32(),
      thetaMod : reader.float32(),
      phiMod   : reader.float32(),

      kVX      : reader.float32(),
      kVY      : reader.float32(),
      kMode    : reader.uint32(),

      ui       : {
        time        : reader.float32(),
        theta       : reader.float32(),
        phi         : reader.float32(),
        psi         : reader.float32(),
        psiAccuracy : reader.float32(),
        seq         : reader.int32()
      }
    };
  },

  'trims': function(reader) {
    return {
      angularRates : {
        r : reader.float32()
      },
      eulerAngles : {
        theta : reader.float32(), // [mdeg?]
        phi   : reader.float32()  // [mdeg?]
      }
    };
  },

  'rcReferences': function(reader) {
    return {
      pitch : reader.int32(), // [mdeg?]
      roll  : reader.int32(), // [mdeg?]
      yaw   : reader.int32(), // [mdeg/s?]
      gaz   : reader.int32(),
      ag    : reader.int32()
    };
  },

  'pwm': function(reader) {
    return {
      motors           : timesMap(4, reader.uint8, reader), // [PWM]
      satMotors        : timesMap(4, reader.uint8, reader), // [PWM]
      gazFeedForward   : reader.float32(), // [PWM]
      gazAltitude      : reader.float32(), // [PWM]
      altitudeIntegral : reader.float32(), // [mm/s]
      vzRef            : reader.float32(), // [mm/s]
      uPitch           : reader.int32(), // [PWM]
      uRoll            : reader.int32(), // [PWM]
      uYaw             : reader.int32(), // [PWM]
      yawUI            : reader.float32(), // [PWM] yaw_u_I
      uPitchPlanif     : reader.int32(), // [PWM]
      uRollPlanif      : reader.int32(), // [PWM]
      uYawPlanif       : reader.int32(), // [PWM]
      uGazPlanif       : reader.float32(), // [PWM]
      motorCurrents    : timesMap(4, reader.uint16, reader), // [mA]
      altitudeProp     : reader.float32(), // [PWM]
      altitudeDer      : reader.float32()  // [PWM]
    };
  },

  'altitude': function(reader) {
    return {
      vision   : reader.int32(),   // [mm]
      velocity : reader.float32(), // [mm/s]
      ref      : reader.int32(),   // [mm]
      raw      : reader.int32(),   // [mm]
      observer : {
        acceleration : reader.float32(), // [m/s2]
        altitude     : reader.float32(), // [m]
        x            : reader.vector31(),
        state        : reader.uint32()
      },
      estimated : {
        vb    : {
          x : reader.float32(),
          y : reader.float32()
        },
        state : reader.uint32()
      }
    };
  },

  'visionRaw': function(reader) {
    return {
      tx : reader.float32(),
      ty : reader.float32(),
      tz : reader.float32()
    };
  },

  'visionOf': function(reader) {
    return {
      dx : timesMap(5, reader.float32, reader),
      dy : timesMap(5, reader.float32, reader)
    };
  },

  'vision': function(reader) {
    return {
      state         : reader.uint32(),
      misc          : reader.int32(),
      phi: {
        trim       : reader.float32(), // [rad]
        refProp    : reader.float32()  // [rad]
      },
      theta: {
        trim     : reader.float32(), // [rad]
        refProp  : reader.float32()  // [rad]
      },
      newRawPicture : reader.int32(),
      capture       : {
        theta    : reader.float32(),
        phi      : reader.float32(),
        psi      : reader.float32(),
        altitude : reader.int32(),
        time     : droneTimeToMilliSeconds(reader.uint32())
      },
      bodyV         : reader.vector31(), // [mm/s]
      delta         : {
        phi   : reader.float32(),
        theta : reader.float32(),
        psi   : reader.float32()
      },
      gold          : {
        defined : reader.uint32(),
        reset   : reader.uint32(),
        x       : reader.float32(),
        y       : reader.float32()
      }
    };
  },

  'visionPerf': function(reader) {
    return {
      szo      : reader.float32(),
      corners  : reader.float32(),
      compute  : reader.float32(),
      tracking : reader.float32(),
      trans    : reader.float32(),
      update   : reader.float32(),
      custom   : timesMap(20, reader.float32, reader)
    };
  },

  'trackersSend': function(reader) {
    return {
      locked : timesMap(30, reader.int32, reader),
      point  : timesMap(30, reader.screenPoint, reader)
    };
  },

  'visionDetect': function(reader) {
    return {
      nbDetected       : reader.uint32(),
      type             : timesMap(4, reader.uint32, reader),
      xc               : timesMap(4, reader.uint32, reader),
      yc               : timesMap(4, reader.uint32, reader),
      width            : timesMap(4, reader.uint32, reader),
      height           : timesMap(4, reader.uint32, reader),
      dist             : timesMap(4, reader.uint32, reader),
      orientationAngle : timesMap(4, reader.float32, reader),
      rotation         : timesMap(4, reader.matrix33, reader),
      translation      : timesMap(4, reader.vector31, reader),
      cameraSource     : timesMap(4, reader.uint32, reader)
    };
  },

  'watchdog': function(reader) {
    return reader.uint32();
  },

  'adcDataFrame': function(reader) {
    return {
      version   : reader.uint32(),
      dataFrame : timesMap(32, reader.uint8, reader)
    };
  },

  'videoStream': function(reader) {
    return {
      quant          : reader.uint8(),
      frame          : {
        size   : reader.uint32(), // [bytes]
        number : reader.uint32()
      },
      atcmd          : {
        sequence : reader.uint32(),
        meanGap  : reader.uint32(), // [ms]
        varGap   : reader.float32(), // [SU]
        quality  : reader.uint32()
      },
      bitrate        : {
        out     : reader.uint32(),
        desired : reader.uint32()
      },
      data           : timesMap(5, reader.int32, reader),
      tcpQueueLevel  : reader.uint32(),
      fifoQueueLevel : reader.uint32()
    };
  },

  'games': function(reader) {
    return {
      counters: {
        doubleTap  : reader.uint32(),
        finishLine : reader.uint32()
      }
    };
  },

  'pressureRaw': function(reader) {
    return {
      up          : reader.int32(), // [LSB] (UP?)
      ut          : reader.int16(), // [LSB] (UT?)
      temperature : reader.int32(), // [0_1C]
      pressure    : reader.int32()  // [Pa]
    };
  },

  'magneto': function(reader) {
    return {
      mx        : reader.int16(), // [LSB]
      my        : reader.int16(), // [LSB]
      mz        : reader.int16(), // [LSB]
      raw       : reader.vector31(), // [mG]
      rectified : reader.vector31(), // [mG]
      offset    : reader.vector31(), // [mG]
      heading   : {
        unwrapped: reader.float32(), // [deg]
        gyroUnwrapped: reader.float32(), // [deg]
        fusionUnwrapped: reader.float32() // [mdeg]
      },
      ok     : reader.char(),
      state  : reader.uint32(), // [SU]
      radius : reader.float32(), // [mG]
      error  : {
        mean     : reader.float32(), // [mG]
        variance : reader.float32()  // [mG2]
      }
    };
  },

  'windSpeed': function(reader) {
    return {
      speed: reader.float32(), // [m/s]
      angle: reader.float32(), // [deg]
      compensation: {
        theta: reader.float32(), // [rad]
        phi: reader.float32()
      },
      stateX: timesMap(6, reader.float32, reader), // [SU]
      debug: timesMap(3, reader.float32, reader)
    };
  },

  'kalmanPressure': function(reader) {
    return {
      offsetPressure: reader.float32(), // [Pa]
      estimated: {
        altitude: reader.float32(), // [mm]
        velocity: reader.float32(), // [m/s]
        angle: {
          pwm: reader.float32(), // [m/s2]
          pressure: reader.float32() // [Pa]
        },
        us: {
          offset: reader.float32(), // [m]
          prediction: reader.float32() // [mm]
        },
        covariance: {
          alt: reader.float32(), // [m]
          pwm: reader.float32(),
          velocity: reader.float32() // [m/s]
        },
        groundEffect: reader.bool(), // [SU]
        sum: reader.float32(), // [mm]
        reject: reader.bool(), // [SU]
        uMultisinus: reader.float32(),
        gazAltitude: reader.float32(),
        flagMultisinus: reader.bool(),
        flagMultisinusStart: reader.bool()
      }
    };
  },

  'hdvideoStream': function(reader) {
    var values = {
      hdvideoState : reader.uint32(),
      storageFifo  : {
        nbPackets : reader.uint32(),
        size      : reader.uint32()
      },
      usbkey       : {
        size      : reader.uint32(),
        freespace : reader.uint32()
      },
      frameNumber  : reader.uint32()
    };
    values.usbkey.remainingTime = reader.uint32();

    return values;
  },

  'wifi': function(reader) {
    return {
      // from ARDrone_SDK_2_0/ControlEngine/iPhone/Classes/Controllers/MainViewController.m
      linkQuality: (1 - (reader.float32()))
    };
  },

  'zimmu3000': function(reader) {
    return {
      vzimmuLSB: reader.int32(),  // [LSB]
      vzfind: reader.float32()
    };
  }
};


// Constants

exports.NAVDATA_HEADER = 0x55667788;

// from ARDrone_SDK_2_0/ARDroneLib/Soft/Common/config.h
exports.DRONE_STATES = {
  flying                     : 1 << 0,  /*!< FLY MASK : (0) ardrone is landed, (1) ardrone is flying */
  videoEnabled               : 1 << 1,  /*!< VIDEO MASK : (0) video disable, (1) video enable */
  visionEnabled              : 1 << 2,  /*!< VISION MASK : (0) vision disable, (1) vision enable */
  controlAlgorithm           : 1 << 3,  /*!< CONTROL ALGO : (0) euler angles control, (1) angular speed control */
  altitudeControlAlgorithm   : 1 << 4,  /*!< ALTITUDE CONTROL ALGO : (0) altitude control inactive (1) altitude control active */
  startButtonState           : 1 << 5,  /*!< USER feedback : Start button state */
  controlCommandAck          : 1 << 6,  /*!< Control command ACK : (0) None, (1) one received */
  cameraReady                : 1 << 7,  /*!< CAMERA MASK : (0) camera not ready, (1) Camera ready */
  travellingEnabled          : 1 << 8,  /*!< Travelling mask : (0) disable, (1) enable */
  usbReady                   : 1 << 9,  /*!< USB key : (0) usb key not ready, (1) usb key ready */
  navdataDemo                : 1 << 10, /*!< Navdata demo : (0) All navdata, (1) only navdata demo */
  navdataBootstrap           : 1 << 11, /*!< Navdata bootstrap : (0) options sent in all or demo mode, (1) no navdata options sent */
  motorProblem               : 1 << 12, /*!< Motors status : (0) Ok, (1) Motors problem */
  communicationLost          : 1 << 13, /*!< Communication Lost : (1) com problem, (0) Com is ok */
  softwareFault              : 1 << 14, /*!< Software fault detected - user should land as quick as possible (1) */
  lowBattery                 : 1 << 15, /*!< VBat low : (1) too low, (0) Ok */
  userEmergencyLanding       : 1 << 16, /*!< User Emergency Landing : (1) User EL is ON, (0) User EL is OFF*/
  timerElapsed               : 1 << 17, /*!< Timer elapsed : (1) elapsed, (0) not elapsed */
  MagnometerNeedsCalibration : 1 << 18, /*!< Magnetometer calibration state : (0) Ok, no calibration needed, (1) not ok, calibration needed */
  anglesOutOfRange           : 1 << 19, /*!< Angles : (0) Ok, (1) out of range */
  tooMuchWind                : 1 << 20, /*!< WIND MASK: (0) ok, (1) Too much wind */
  ultrasonicSensorDeaf       : 1 << 21, /*!< Ultrasonic sensor : (0) Ok, (1) deaf */
  cutoutDetected             : 1 << 22, /*!< Cutout system detection : (0) Not detected, (1) detected */
  picVersionNumberOk         : 1 << 23, /*!< PIC Version number OK : (0) a bad version number, (1) version number is OK */
  atCodecThreadOn            : 1 << 24, /*!< ATCodec thread ON : (0) thread OFF (1) thread ON */
  navdataThreadOn            : 1 << 25, /*!< Navdata thread ON : (0) thread OFF (1) thread ON */
  videoThreadOn              : 1 << 26, /*!< Video thread ON : (0) thread OFF (1) thread ON */
  acquisitionThreadOn        : 1 << 27, /*!< Acquisition thread ON : (0) thread OFF (1) thread ON */
  controlWatchdogDelay       : 1 << 28, /*!< CTRL watchdog : (1) delay in control execution (> 5ms), (0) control is well scheduled */
  adcWatchdogDelay           : 1 << 29, /*!< ADC Watchdog : (1) delay in uart2 dsr (> 5ms), (0) uart2 is good */
  comWatchdogProblem         : 1 << 30, /*!< Communication Watchdog : (1) com problem, (0) Com is ok */
  emergencyLanding           : 1 << 31  /*!< Emergency landing : (0) no emergency, (1) emergency */
};

exports.OPTION_IDS = {
  0     : 'demo',
  1     : 'time',
  2     : 'rawMeasures',
  3     : 'physMeasures',
  4     : 'gyrosOffsets',
  5     : 'eulerAngles',
  6     : 'references',
  7     : 'trims',
  8     : 'rcReferences',
  9     : 'pwm',
  10    : 'altitude',
  11    : 'visionRaw',
  12    : 'visionOf',
  13    : 'vision',
  14    : 'visionPerf',
  15    : 'trackersSend',
  16    : 'visionDetect',
  17    : 'watchdog',
  18    : 'adcDataFrame',
  19    : 'videoStream',
  20    : 'games',
  21    : 'pressureRaw',
  22    : 'magneto',
  23    : 'windSpeed',
  24    : 'kalmanPressure',
  25    : 'hdvideoStream',
  26    : 'wifi',
  27    : 'zimmu3000',
  65535 : 'checksum'
};

exports.CONTROL_STATES = {
  0: 'CTRL_DEFAULT',
  1: 'CTRL_INIT',
  2: 'CTRL_LANDED',
  3: 'CTRL_FLYING',
  4: 'CTRL_HOVERING',
  5: 'CTRL_TEST',
  6: 'CTRL_TRANS_TAKEOFF',
  7: 'CTRL_TRANS_GOTOFIX',
  8: 'CTRL_TRANS_LANDING',
  9: 'CTRL_TRANS_LOOPING'
};

exports.FLY_STATES = {
  0: 'FLYING_OK',
  1: 'FLYING_LOST_ALT',
  2: 'FLYING_LOST_ALT_GO_DOWN',
  3: 'FLYING_ALT_OUT_ZONE',
  4: 'FLYING_COMBINED_YAW',
  5: 'FLYING_BRAKE',
  6: 'FLYING_NO_VISION'
};

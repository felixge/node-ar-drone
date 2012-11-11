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
    var theta             = reader.float32() / 1000;
    var phi               = reader.float32() / 1000;
    var psi               = reader.float32() / 1000;
    var altitude          = reader.int32() / 1000;
    var velocity          = reader.vector31();
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
    return {
      controlState : controlState,
      flyState     : flyState,

      batteryPercentage : batteryPercentage,
      rotation          : {
        frontBack  : theta,
        pitch      : theta,
        theta      : theta,
        y          : theta,

        leftRight  : phi,
        roll       : phi,
        phi        : phi,
        x          : phi,

        clockwise  : psi,
        yaw        : psi,
        psi        : psi,
        z          : psi
      },
      altitude    : altitude,
      // @TODO figure out what units those are
      velocity    : velocity,

      frameIndex  : frameIndex,
      detection   : detection,
      drone       : drone
    };
  },

  'time': function(reader) {
    var time = reader.uint32();
    return droneTimeToMilliSeconds(time);
  },

  'rawMeasures': function(reader) {
    return {
      accelerometers: {
        x: reader.uint16(),
        y: reader.uint16(),
        z: reader.uint16()
      },
      gyrometers: {
        x: reader.int16(),
        y: reader.int16(),
        z: reader.int16()
      },
      // gyrometers  x/y 110 deg/s (@TODO figure out what that means)
      gyrometers110: {
        x: reader.int16(),
        y: reader.int16()
      },
      batteryMilliVolt: reader.uint32(),
      // no idea what any of those are
      us: {
        echo: {
          start       : reader.uint16(),
          end         : reader.uint16(),
          association : reader.uint16(),
          distance    : reader.uint16()
        },
        curve: {
          time  : reader.uint16(),
          value : reader.uint16(),
          ref   : reader.uint16()
        }
      },
      echo: {
        flagIni : reader.uint16(),
        num     : reader.uint16(),
        sum     : reader.uint32()
      },
      altTempRaw  : reader.int32()
    };
  },

  'pwm': function(reader) {
    return {
      motors           : timesMap(4, reader.uint8, reader),
      satMotors        : timesMap(4, reader.uint8, reader),
      gazFeedForward   : reader.float32(),
      gazAltitude      : reader.float32(),
      altitudeIntegral : reader.float32(),
      vzRef            : reader.float32(),
      uPitch           : reader.int32(),
      uRoll            : reader.int32(),
      uYaw             : reader.int32(),
      yawUI            : reader.float32(),
      uPitchPlanif     : reader.int32(),
      uRollPlanif      : reader.int32(),
      uYawPlanif       : reader.int32(),
      uGazPlanif       : reader.float32(),
      motorCurrents    : timesMap(4, reader.uint16, reader),
      altitudeProp     : reader.float32(),
      altitudeDer      : reader.float32()
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
        size   : reader.uint32(),
        number : reader.uint32()
      },
      atcmd          : {
        sequence : reader.uint32(),
        meanGap  : reader.uint32(),
        varGap   : reader.float32(),
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
      up          : reader.int32(),
      ut          : reader.int16(),
      temperature : reader.int32(),
      pressure    : reader.int32()
    };
  },

  'magneto': function(reader) {
    return {
      mx        : reader.int16(),
      my        : reader.int16(),
      mz        : reader.int16(),
      raw       : reader.vector31(),
      rectified : reader.vector31(),
      offset    : reader.vector31(),
      heading   : {
        unwrapped: reader.float32(),
        gyroUnwrapped: reader.float32(),
        fusionUnwrapped: reader.float32()
      },
      ok     : reader.char(),
      state  : reader.uint32(),
      radius : reader.float32(),
      error  : {
        mean     : reader.float32(),
        variance : reader.float32()
      }
    };
  },

  'windSpeed': function(reader) {
    return {
      speed: reader.float32(),
      angle: reader.float32(),
      compenstation: {
        theta: reader.float32(),
        phi: reader.float32()
      },
      stateX: timesMap(6, reader.float32, reader),
      debug: timesMap(3, reader.float32, reader)
    };
  },

  'kalmanPressure': function(reader) {
    return {
      offsetPressure: reader.float32(),
      est: {
        z: reader.float32(),
        zdot: reader.float32(),
        angle: {
          pwm: reader.float32(),
          pressure: reader.float32()
        },
        us: {
          offset: reader.float32(),
          prediction: reader.float32()
        },
        covariance: {
          alt: reader.float32(),
          pwm: reader.float32(),
          speed: reader.float32()
        },
        groundEffect: reader.bool(),
        sum: reader.float32(),
        reject: reader.bool(),
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
      // linkQuality: (1 - (reader.float32())),
      // from ARDrone_SDK_2_0/ARDroneLib/Soft/Common/navdata_common.h
      linkQuality : reader.uint32()
    };
  },

  'zimmu3000': function(reader) {
    return {
      vzimmuLSB: reader.int32(),
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

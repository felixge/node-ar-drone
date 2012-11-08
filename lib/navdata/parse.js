var _ = require('underscore');
var createMessage = require('./message');
// @TODO: refactor this guy
var NavdataReader = require('../navdata.old/NavdataReader');
var options = require('./options');

var exports = module.exports = function parseNavdata(buffer, log) {
  var message = createMessage();
  var reader = new NavdataReader(buffer);

  var header = reader.uint32();
  if (header !== exports.HEADER) {
    log.write('navdata: received unknown header: 0x' + header.toString(16));
    return;
  }

  _.extend(message.status, reader.mask32(exports.STATUSES));
  message.sequenceNumber = reader.uint32();
  message.visionFlag = reader.uint32();
  message.received = new Date;

  parseOptions(buffer, reader, message);

  return message;
};

function parseOptions(buffer, reader, message) {
  while (true) {
    var optionId = reader.uint16();
    var optionName = exports.OPTIONS[optionId];
    var optionLength = reader.uint16();

    // length includes header size (4 bytes)
    var optionReader = new NavdataReader(reader.buffer(optionLength - 4));

    if (optionName === 'checksum') {
      verifyChecksum(buffer, optionReader, optionLength);
      break;
    }

    if (optionName in options) {
      options[optionName](optionReader, message);
    }

    message.options.push(optionName);
  }
}

function verifyChecksum(buffer, optionReader, optionLength) {
  var expectedChecksum = 0;
  for (var i = 0; i < buffer.length - optionLength; i++) {
    expectedChecksum += buffer[i];
  }

  var checksum = optionReader.uint32();

  if (checksum !== expectedChecksum) {
    throw new Error('Invalid checksum, expected: ' + expectedChecksum + ', got: ' + checksum);
  }
}

exports.HEADER = 0x55667788;

exports.OPTIONS = {
  0     : 'demo',
  1     : 'time',
  2     : 'rawMeasures',
  3     : 'phyMeasures',
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
  65535 : 'checksum',
};

// from ARDrone_SDK_2_0/ARDroneLib/Soft/Common/config.h
exports.STATUSES = {
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
  magnometerNeedsCalibration : 1 << 18, /*!< Magnetometer calibration state : (0) Ok, no calibration needed, (1) not ok, calibration needed */
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

var MessageParser = require('./MessageParser');

module.exports = Navdata;
function Navdata(options) {
  this.sequence = options.sequence;

  // + DRONESTATES (see below)
}

// @TODO: Give some of these better names
Navdata.DRONESTATES = {
  flying            : 1 << 0, /*!< FLY MASK : (0) mykonos is landed, (1) mykonos is flying */
  video             : 1 << 1, /*!< VIDEO MASK : (0) video disable, (1) video enable */
  vision            : 1 << 2, /*!< VISION MASK : (0) vision disable, (1) vision enable */
  control           : 1 << 3, /*!< CONTROL ALGO : (0) euler angles control, (1) angular speed control */
  altitude          : 1 << 4, /*!< ALTITUDE CONTROL ALGO : (0) altitude control inactive (1) altitude control active */
  userFeedbackStart : 1 << 5, /*!< USER feedback : Start button state */
  command           : 1 << 6, /*!< Control command ACK : (0) None, (1) one received */
  trimCommand       : 1 << 7, /*!< Trim command ACK : (0) None, (1) one received */
  trimRunning       : 1 << 8, /*!< Trim running : (0) none, (1) running */
  trimResult        : 1 << 9, /*!< Trim result : (0) failed, (1) succeeded */
  navdataDemo       : 1 << 10, /*!< Navdata demo : (0) All navdata, (1) only navdata demo */
  navdataBootstrap  : 1 << 11, /*!< Navdata bootstrap : (0) options sent in all or demo mode, (1) no navdata options sent */
  motorsBrushed     : 1 << 12, /*!< Motors brushed : (0) brushless, (1) brushed */
  communicationLost : 1 << 13, /*!< Communication Lost : (1) com problem, (0) Com is ok */
  gyrosProblem      : 1 << 14, /*!< Bit means that there's an hardware problem with gyrometers */
  vbatLow           : 1 << 15, /*!< VBat low : (1) too low, (0) Ok */
  vbatHigh          : 1 << 16, /*!< VBat high (US mad) : (1) too high, (0) Ok */
  timerElapsed      : 1 << 17, /*!< Timer elapsed : (1) elapsed, (0) not elapsed */
  notEnoughPower    : 1 << 18, /*!< Power : (0) Ok, (1) not enough to fly */
  angles            : 1 << 19, /*!< Angles : (0) Ok, (1) out of range */
  wind              : 1 << 20, /*!< Wind : (0) Ok, (1) too much to fly */
  ultrasound        : 1 << 21, /*!< Ultrasonic sensor : (0) Ok, (1) deaf */
  cutout            : 1 << 22, /*!< Cutout system detection : (0) Not detected, (1) detected */
  picVersion        : 1 << 23, /*!< PIC Version number OK : (0) a bad version number, (1) version number is OK */
  atcodecThreadOn   : 1 << 24, /*!< ATCodec thread ON : (0) thread OFF (1) thread ON */
  navdataThreadOn   : 1 << 25, /*!< Navdata thread ON : (0) thread OFF (1) thread ON */
  videoThreadOn     : 1 << 26, /*!< Video thread ON : (0) thread OFF (1) thread ON */
  acqThreadOn       : 1 << 27, /*!< Acquisition thread ON : (0) thread OFF (1) thread ON */
  ctrlWatchdog      : 1 << 28, /*!< CTRL watchdog : (1) delay in control execution (> 5ms), (0) control is well scheduled */
  adcWatchdog       : 1 << 29, /*!< ADC Watchdog : (1) delay in uart2 dsr (> 5ms), (0) uart2 is good */
  comWatchdog       : 1 << 30, /*!< Communication Watchdog : (1) com problem, (0) Com is ok */
  emergency         : 1 << 31, /*!< Emergency landing : (0) no emergency, (1) emergency */
}

Navdata.parse = function(buffer) {
  var parser  = new MessageParser(buffer);

  var header = parser.number(4);

  // The header is always supposed to be this value according to the docs.
  if (header !== 0x55667788) {
    throw new Error('Invalid header value: ' + header.toString(16));
  }

  var dronestate = parser.number(4);
  var sequence   = parser.number(4);
  var visionflag = parser.number(4); // @TODO: Parse this

  while (parser.bytesLeft()) {
    var optionId = parser.number(2);
    var size = parser.number(2) - 4;

    switch (optionId) {
      //case 1:
        //var value = parser.number(size);
        //console.log('1 option', value);
        //parser.skip(size);
        //break;
      case 0xffff:
      default:
        //console.log('unknown option', optionId);
        parser.skip(size);
    }

  }

  var navdata = new Navdata({
    sequence : sequence,
  });

  for (var state in Navdata.DRONESTATES) {
    navdata[state] = Boolean(Navdata.DRONESTATES[state] & dronestate);
  }

  return navdata;
};

Navdata.prototype.diff = function(navdata) {
  navdata = navdata || {};

  var diff = {};

  for (var state in Navdata.DRONESTATES) {
    if (this[state] !== navdata[state]) {
      diff[state] = this[state];
    }
  }

  return diff;
};

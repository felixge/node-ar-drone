var _ = require('underscore');

module.exports = function createConfig(options) {
 options = _.defaults(options || {}, {
    ip: '192.168.1.1',
    controlInterval: 30,
    ftpPort: 5551,
    authPort: 5552,
    videoRecorderPort: 5553,
    navdataPort: 5554,
    videoPort: 5555,
    atPort: 5556,
    rawCapturePort: 5557,
    printfPort: 5558,
    controlPort: 5557,
  });

  return new Config(options);
};

module.exports.Config = Config;
function Config(options) {
  this.ip = options.ip;
  this.controlInterval = options.controlInterval;

  // from ARDrone_SDK_2_0/ARDroneLib/Soft/Common/config.h
  this.ftpPort = options.ftpPort;
  this.authPort = options.authPort;
  this.videoRecorderPort = options.videoRecorderPort;
  this.navdataPort = options.navdataPort;
  this.videoPort = options.videoPort;
  this.atPort = options.atPort;
  this.rawCapturePort = options.rawCapturePort;
  this.printfPort = options.printfPort;
  this.controlPort = options.controlPort;
}

module.exports = function createConfig(options) {
  return new Config(options || {});
};

module.exports.Config = Config;
function Config(options) {
  this.ip = options.ip || '192.168.1.1';
  this.udpInterval = options.udpInterval || 30;
  this.navdataTimeout = options.navdataTimeout || 250;

  // from ARDrone_SDK_2_0/ARDroneLib/Soft/Common/config.h
  this.ftpPort = options.ftpPort || 5551;
  this.authPort = options.authPort || 5552;
  this.videoRecorderPort = options.videoRecorderPort || 5553;
  this.navdataPort = options.navdataPort || 5554;
  this.videoPort = options.videoPort || 5555;
  this.atPort = options.atPort || 5556;
  this.rawCapturePort = options.rawCapturePort || 5557;
  this.printfPort = options.printfPort || 5558;
  this.controlPort = options.controlPort || 5559;
}

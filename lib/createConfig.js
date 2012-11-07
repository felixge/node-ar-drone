module.exports = function createConfig() {
  return new Config();
};

module.exports.Config = Config;
function Config() {
  this.ip              = '192.168.1.1';
  this.controlInterval = 30;

  // from ARDrone_SDK_2_0/ARDroneLib/Soft/Common/config.h
  this.ftpPort           = 5551;
  this.authPort          = 5552;
  this.videoRecorderPort = 5553;
  this.navdataPort       = 5554;
  this.videoPort         = 5555;
  this.atPort            = 5556;
  this.rawCapturePort    = 5557;
  this.printfPort        = 5558;
  this.controlPort       = 5557;
}

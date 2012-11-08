var exports = module.exports = function parseWifiOption(reader, message) {
  // from ARDrone_SDK_2_0/ControlEngine/iPhone/Classes/Controllers/MainViewController.m
  message.wifiQuality = (1 - (reader.float32()));
};

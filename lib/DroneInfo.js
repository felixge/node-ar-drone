module.exports = DroneInfo;
function DroneInfo(navdata) {
  var state = navdata.droneState || {};
  var demo  = navdata.options.DEMO || {};

  this.batteryLow        = state.VBAT_LOW;
  this.batteryPercentage = demo.vbatFlyingPercentage;
  this.altitude          = demo.altitude / 1000;
  this.yaw               = demo.yaw / 1000;
}

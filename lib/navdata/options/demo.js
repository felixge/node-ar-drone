var exports = module.exports = function parseDemoOption(reader, message) {
  // simplified version of ctrl_state_str (in ARDrone_SDK_2_0/Examples/Linux/Navigation/Sources/navdata_client/navdata_ihm.c)
  message.flyState = exports.FLY_STATES[reader.uint16()];
  message.controlState = exports.CONTROL_STATES[reader.uint16()];

  // a percentage, changing it to a value between 0 and 1
  message.batteryLevel = reader.uint32() / 100;

  // milli-degrees, changing this to degrees
  message.orientation.frontBack = reader.float32() / 1000;
  message.orientation.leftRight = reader.float32() / 1000;
  message.orientation.clockSpin = reader.float32() / 1000;

  // millimeters, changing this to meters
  message.altitude = reader.uint32() / 1000;

  // not sure about those units yet, axes could also be wrong
  message.speed.leftRight = reader.float32();
  message.speed.frontBack = reader.float32();
  message.speed.upDown = reader.float32();

  // there are more fields available here, but they seem deprecated / useless
};

exports.CONTROL_STATES = {
  0: 'default',
  1: 'init',
  2: 'landed',
  3: 'flying',
  4: 'hovering',
  5: 'test',
  6: 'takoff',
  7: 'gotoFix',
  8: 'landing',
  9: 'looping',
}

exports.FLY_STATES = {
  0: 'ok',
  1: 'lostAltitude',
  2: 'lostAltitudeGoDown',
  3: 'altitudeOutZone',
  4: 'combinedYaw',
  5: 'brake',
  6: 'noVision',
}

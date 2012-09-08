// module for generic AT command related functionality
var at = exports;

at.floatString = function(number) {
  // Not sure if this is correct, but it works for the example provided in
  // the drone manual ... (should be revisted)
  var buffer = new Buffer(4);
  buffer.writeFloatBE(number, 0);
  return -~parseInt(buffer.toString('hex'), 16) - 1;
};

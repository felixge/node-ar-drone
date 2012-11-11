var command = require('../command');
var atFloatToString = require('../atFloatToString');

var exports = module.exports = function pcmdCommand(options, number) {
  options = options || {};

  var args = [
    0,
    atFloatToString(options.leftRight),
    atFloatToString(-options.frontBack),
    atFloatToString(options.upDown),
    atFloatToString(options.clockSpin),
  ];

  // determine if the drone is supposed to move or not
  var move = args.some(function(value) {
    return value !== 0;
  });

  if (move) {
    args[0] = args[0] | exports.PROGRESSIVE;
  }

  return command('PCMD', args, number);
};

exports.PROGRESSIVE = (1 << 0);

var command = require('../command');

var exports = module.exports = function refCommand(options, number) {
  options = options || {};

  var flags =
    (options.fly && exports.FLY) |
    (options.emergency && exports.EMERGENCY);


  return command('REF', [flags], number);
};

exports.EMERGENCY = (1 << 8);
exports.FLY = (1 << 9);

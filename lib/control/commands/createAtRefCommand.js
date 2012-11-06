var createAtCommand = require('../createAtCommand');

var exports = module.exports = function createAtRefCommand(options, number) {
  options = options || {};

  var flags =
    (options.fly && exports.FLY) |
    (options.emergency && exports.EMERGENCY);


  return createAtCommand('REF', [flags], number);
};

exports.EMERGENCY = (1 << 8);
exports.FLY       = (1 << 9);

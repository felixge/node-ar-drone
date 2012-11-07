var createCommand = require('../createCommand');

var exports = module.exports = function createRefCommand(options, number) {
  options = options || {};

  var flags =
    (options.fly && exports.FLY) |
    (options.emergency && exports.EMERGENCY);


  return createCommand('REF', [flags], number);
};

exports.EMERGENCY = (1 << 8);
exports.FLY       = (1 << 9);

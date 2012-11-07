var _               = require('underscore');
var createCommand = require('../createCommand');
var atFloatToString = require('../atFloatToString');

var exports = module.exports = function createConfigCommand(options, number) {
  options = _.defaults(options || {}, {
    key: '',
    value: '',
  });

  var args = ['"' + options.key + '"', '"' + options.value + '"'];
  return createCommand('CONFIG', args, number);
};

var _               = require('underscore');
var createAtCommand = require('./createAtCommand');
var atFloatToString = require('../atFloatToString');

var exports = module.exports = function createAtConfigCommand(options) {
  options = _.defaults(options || {}, {
    key: '',
    value: '',
  });

  var args = ['"' + options.key + '"', '"' + options.value + '"'];
  return createAtCommand('CONFIG', args, options.number);
};

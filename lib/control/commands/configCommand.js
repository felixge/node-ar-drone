var _ = require('underscore');
var command = require('../command');
var atFloatToString = require('../atFloatToString');

var exports = module.exports = function configCommand(options, number) {
  options = _.defaults(options || {}, {
    key: '',
    value: '',
  });

  var args = ['"' + options.key + '"', '"' + options.value + '"'];
  return command('CONFIG', args, number);
};

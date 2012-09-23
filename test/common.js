var common = exports;
var path   = require('path');

common.root     = path.join(__dirname, '..');
common.lib      = path.join(common.root, 'lib');
common.fixtures = path.join(__dirname, 'fixtures');

common.UDP_PORT = 13571;
common.TCP_PORT = 13572;

common.isTravisCi = function() {
  return Boolean(process.env.CI);
};

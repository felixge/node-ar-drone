var createConfig = require('./config');
var createNavdata = require('./navdata');
var createControl = require('./control');
var createLog = require('./log');

module.exports = function createNewClient(options) {
  options = options || {};
  options.config = options.config || createConfig(options);
  options.log = options.log || createLog(options);

  // @TODO: make this configureable
  options.log.pipe(process.stdout);

  options.navdata = options.navdata || createNavdata(options);
  options.control = options.control || createControl(options);

  return new NewClient(options);
};

module.exports.NewClient = NewClient;
function NewClient(options) {
  this.control = options.control;
  this.navdata = options.navdata;
  this.config = options.config;
  this.log = options.log;
}

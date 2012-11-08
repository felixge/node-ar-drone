var util = require('util');
var createConfig = require('./config');
var createNavdata = require('./navdata');
var createControl = require('./control');
var createLog = require('./log');
var createBlackBox = require('./blackBox');

module.exports = function createNewClient(options) {
  options = options || {};
  options.config = options.config || createConfig(options);
  options.log = options.log || createLog(options);

  // @TODO: make this configureable
  options.log.pipe(process.stdout);


  options.navdata = options.navdata || createNavdata(options);
  options.control = options.control || createControl(options);

  options.navdata.pipe(options.control);
  options.blackBox = options.blackBox || createBlackBox(options);

  var client = new NewClient(options);

  options.blackBox.resume();
  options.blackBox.on('ready', function() {
    client.resume();
  });

  return client;
};

module.exports.NewClient = NewClient;
function NewClient(options) {
  this.control = options.control;
  this.navdata = options.navdata;
  this.config = options.config;
  this.log = options.log;
}

NewClient.prototype.inspect = function() {
  return util.inspect({
    control: this.control,
    navdata: this.navdata,
    config: this.config,
  });
};

NewClient.prototype.resume = function() {
  this.navdata.resume();
  this.control.resume();
};

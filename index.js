var Client       = require('./lib/Client');
var ClientConfig = require('./lib/ClientConfig');

exports.createClient = function(options) {
  var client = new Client({config: new ClientConfig(options)});
  return client;
};

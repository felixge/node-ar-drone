var common           = require('../../../common');
var UdpNavdataStream = require(common.lib + '/navdata/UdpNavdataStream');
var dgram            = require('dgram');
var assert           = require('assert');

var receivedData = false;
var stream       = new UdpNavdataStream();

stream.resume();

stream.on('data', function(navdata) {
  receivedData = true;

  console.log(navdata);
});

process.on('exit', function() {
  assert.equal(receivedData, true);
});

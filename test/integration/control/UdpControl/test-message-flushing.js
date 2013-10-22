var common     = require('../../../common');
var UdpControl = require(common.lib + '/control/UdpControl');
var dgram      = require('dgram');
var assert     = require('assert');

var receiver = dgram.createSocket('udp4');
receiver.bind(common.UDP_PORT);

var control = new UdpControl({ip: '127.0.0.1', port: common.UDP_PORT});

var expectMessage = control.ref().serialize(0) + control.pcmd().serialize(1);
control.flush();

var receivedMessage = false;
receiver.on('message', function(buffer) {
  assert.deepEqual(buffer.toString(), expectMessage);

  receiver.close();
  control.close();

  receivedMessage = true;
});

process.on('exit', function() {
  assert.equal(receivedMessage, true);
});

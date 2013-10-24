var common         = require('../../../common');
var net            = require('net');
var assert         = require('assert');
var TcpVideoStream = require(common.lib + '/video/TcpVideoStream');

var server = net.createServer(function() {});

var events = [];
server.listen(common.TCP_PORT, function() {
  var video = new TcpVideoStream({ip: 'localhost', port: common.TCP_PORT, timeout: 100});

  video.connect(function(err) {
    if (err) { throw err; }

    events.push('connectCb');
  });

  video
    .on('error', function(err) {
      assert.equal(/timeout/i.test(err.message), true);

      events.push('close');
      server.close();
    });
});

process.on('exit', function() {
  assert.deepEqual(events, ['connectCb', 'close']);
});

var common         = require('../../../common');
var net            = require('net');
var assert         = require('assert');
var TcpVideoStream = require(common.lib + '/video/TcpVideoStream');

var expectedData = 'some data';
var server = net.createServer(function(connection) {
  connection.write(expectedData);
});

var events = [];
server.listen(common.TCP_PORT, function() {
  var video = new TcpVideoStream({ip: 'localhost', port: common.TCP_PORT});

  video.connect(function(err) {
    if (err) throw err;

    events.push('connectCb');
  });

  video
    .on('data', function(buffer) {
      assert.equal(buffer.toString(), expectedData);
      video.end();

      events.push('data');
    })
    .on('close', function() {
      events.push('close');
      server.close();
    });
});

process.on('exit', function() {
  assert.deepEqual(events, ['connectCb', 'data', 'close']);
});

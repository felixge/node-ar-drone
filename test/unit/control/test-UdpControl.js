var common     = require('../../common');
var assert     = require('assert');
var test       = require('utest');
var sinon      = require('sinon');
var UdpControl = require(common.lib + '/control/UdpControl');

test('UdpControl', {
  'queues commands until flush() is invoked': function() {
    var fakeSocket = {send: sinon.spy()};
    var fakePort   = 12345;
    var fakeIp     = '255.0.23.42';

    var control = new UdpControl({
      socket : fakeSocket,
      port   : fakePort,
      ip     : fakeIp,
    });

    var ref = control.ref();
    assert.equal(ref.type, 'REF');

    var pcmd = control.pcmd();
    assert.equal(pcmd.type, 'PCMD');

    control.flush();

    assert.equal(fakeSocket.send.callCount, 1);

    var sendArgs = fakeSocket.send.getCall(0).args;
    var buffer   = sendArgs.shift();
    var offset   = sendArgs.shift();
    var length   = sendArgs.shift();
    var port     = sendArgs.shift();
    var ip       = sendArgs.shift();

    assert.equal(Buffer.isBuffer(buffer), true);
    assert.deepEqual(buffer.toString(), ref + pcmd);
    assert.deepEqual(offset, 0);
    assert.deepEqual(length, buffer.length);
    assert.deepEqual(port, fakePort);
    assert.deepEqual(ip, fakeIp);

    // there should be nothing to flush now
    control.flush();
    assert.equal(fakeSocket.send.callCount, 1);
  },

  'flush() does not do anything if no commands are queued': function() {
    var control = new UdpControl();
    control.flush();
  },

  'close() is delgated to socket': function() {
    var fakeSocket = {close: sinon.spy()};
    var control = new UdpControl({socket: fakeSocket});

    control.close();
    assert.equal(fakeSocket.close.callCount, 1);
  },
});

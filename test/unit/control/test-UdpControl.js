var common     = require('../../common');
var assert     = require('assert');
var test       = require('utest');
var sinon      = require('sinon');
var AtCommand  = require(common.lib + '/control/AtCommand');
var UdpControl = require(common.lib + '/control/UdpControl');

test('UdpControl', {
  before: function() {
    this.clock = sinon.useFakeTimers();
  },

  after: function() {
    this.clock.restore();
  },

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
    assert.deepEqual(buffer.toString(), ref.serialize(0) + pcmd.serialize(1));
    assert.deepEqual(offset, 0);
    assert.deepEqual(length, buffer.length);
    assert.deepEqual(port, fakePort);
    assert.deepEqual(ip, fakeIp);

    // there should be nothing to flush now
    control.flush();
    assert.equal(fakeSocket.send.callCount, 1);
  },

  'Callbacks are called with an error object for timeouts': function() {
    var fakeSocket = {send: sinon.spy()};
    var fakePort   = 12345;
    var fakeIp     = '255.0.23.42';
    var control = new UdpControl({
      socket : fakeSocket,
      port   : fakePort,
      ip     : fakeIp,
    });
    var callback = sinon.spy();
    control.config('general:navdata_demo', 'TRUE', callback);
    control.flush();
    this.clock.tick(500);
    assert.equal(callback.callCount, 1);
    assert(callback.calledOn(control));
    assert.equal(callback.getCall(0).args.length, 1);
    assert.equal(typeof(callback.getCall(0).args[0]), 'object');
  },

  'Callbacks are called with a null argument for success': function() {
    var fakeSocket = {send: sinon.spy()};
    var fakePort   = 12345;
    var fakeIp     = '255.0.23.42';
    var control = new UdpControl({
      socket : fakeSocket,
      port   : fakePort,
      ip     : fakeIp,
    });
    var callback = sinon.spy();
    control.config('general:navdata_demo', 'TRUE', callback);
    control.flush();
    control.ack();
    control.ackReset();
    assert.equal(callback.callCount, 1);
    assert(callback.calledOn(control));
    assert.equal(callback.getCall(0).args.length, 1);
    assert.deepEqual(callback.getCall(0).args[0], null);
  },

  'Sends non-blocking, then a single blocking command until getting an ack': function() {
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

    var config1 = control.config('general:navdata_demo', 'TRUE');
    var config2 = control.config('general:navdata_demo', 'FALSE');

    control.flush();

    assert.equal(fakeSocket.send.callCount, 2);

    // Should have gotten the non-blocking commands first.
    var sendArgs = fakeSocket.send.getCall(0).args;
    var buffer   = sendArgs.shift();
    var offset   = sendArgs.shift();
    var length   = sendArgs.shift();
    var port     = sendArgs.shift();
    var ip       = sendArgs.shift();

    assert.equal(Buffer.isBuffer(buffer), true);
    assert.deepEqual(buffer.toString(), ref.serialize(0) + pcmd.serialize(1));
    assert.deepEqual(offset, 0);
    assert.deepEqual(length, buffer.length);
    assert.deepEqual(port, fakePort);
    assert.deepEqual(ip, fakeIp);


    // Should have sent a single non-blocking command second.
    sendArgs = fakeSocket.send.getCall(1).args;
    buffer   = sendArgs.shift();
    offset   = sendArgs.shift();
    length   = sendArgs.shift();
    port     = sendArgs.shift();
    ip       = sendArgs.shift();

    assert.equal(Buffer.isBuffer(buffer), true);
    assert.deepEqual(buffer.toString(), config1.serialize(2));
    assert.deepEqual(offset, 0);
    assert.deepEqual(length, buffer.length);
    assert.deepEqual(port, fakePort);
    assert.deepEqual(ip, fakeIp);

    // Another flush should result in nothing additional sent, since
    // we didn't get an ACK so we're still blocked on the first ACK.
    control.flush();
    assert.equal(fakeSocket.send.callCount, 2);

    // Signal an ACK, then flush, and we should see a CTRL command get
    // sent to reset the ACK state.
    control.ack();
    control.flush();

    var ctrl = new AtCommand('CTRL', [5, 0]);
    sendArgs = fakeSocket.send.getCall(2).args;
    buffer   = sendArgs.shift();
    offset   = sendArgs.shift();
    length   = sendArgs.shift();
    port     = sendArgs.shift();
    ip       = sendArgs.shift();

    assert.equal(Buffer.isBuffer(buffer), true);
    assert.deepEqual(buffer.toString(), ctrl.serialize(3));
    assert.deepEqual(offset, 0);
    assert.deepEqual(length, buffer.length);
    assert.deepEqual(port, fakePort);
    assert.deepEqual(ip, fakeIp);

    // Signal the ACK reset, then flush, and we should see the 2nd
    // CONFIG be sent.
    control.ackReset();
    control.flush();

    sendArgs = fakeSocket.send.getCall(3).args;
    buffer   = sendArgs.shift();
    offset   = sendArgs.shift();
    length   = sendArgs.shift();
    port     = sendArgs.shift();
    ip       = sendArgs.shift();

    assert.equal(Buffer.isBuffer(buffer), true);
    assert.deepEqual(buffer.toString(), config2.serialize(4));
    assert.deepEqual(offset, 0);
    assert.deepEqual(length, buffer.length);
    assert.deepEqual(port, fakePort);
    assert.deepEqual(ip, fakeIp);

    // Nothing should be sent for the final flush.
    control.flush();
    assert.equal(fakeSocket.send.callCount, 4);
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
  }
});

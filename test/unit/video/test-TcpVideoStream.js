var common         = require('../../common');
var assert         = require('assert');
var test           = require('utest');
var sinon          = require('sinon');
var EventEmitter   = require('events').EventEmitter;
var TcpVideoStream = require(common.lib + '/video/TcpVideoStream');

test('TcpVideoStream', {
  before: function() {
    this.fakeSocket            = new EventEmitter();
    this.fakeSocket.connect    = sinon.spy();
    this.fakeSocket.setTimeout = sinon.spy();
    this.fakeSocket.end        = sinon.spy();
    this.fakeSocket.destroy    = sinon.spy();

    this.fakePort    = 93321;
    this.fakeIp      = '255.0.124.24';
    this.fakeTimeout = 23 * 1000;

    this.stream = new TcpVideoStream({
      ip      : this.fakeIp,
      port    : this.fakePort,
      timeout : this.fakeTimeout,
      socket  : this.fakeSocket
    });
  },

  'is a readable stream': function() {
    assert.equal(this.stream.readable, true);
    assert.equal(typeof this.stream.pipe, 'function');
  },

  'connect() calls socket.connect': function() {
    this.stream.connect();
    assert.equal(this.fakeSocket.connect.callCount, 1);

    var args = this.fakeSocket.connect.getCall(0).args;
    assert.equal(args.shift(), this.fakePort);
    assert.equal(args.shift(), this.fakeIp);
  },

  'connect() calls socket.setTimeout': function() {
    this.stream.connect();

    var setTimeout = this.fakeSocket.setTimeout;
    assert.equal(setTimeout.callCount, 1);
    assert.equal(setTimeout.getCall(0).args[0], this.fakeTimeout);
  },

  'socket "timeout" events trigger "error", "close" and destroy()': function() {
    var errorSpy = sinon.spy();
    var closeSpy = sinon.spy();
    this.stream.on('error', errorSpy);
    this.stream.on('close', closeSpy);

    this.stream.connect();
    this.fakeSocket.emit('timeout');

    assert.equal(errorSpy.callCount, 1);
    var err = errorSpy.getCall(0).args[0];
    assert.equal(err instanceof Error, true);
    assert.equal(/timeout/i.test(err), true);

    assert.equal(closeSpy.callCount, 1);
    assert.strictEqual(closeSpy.getCall(0).args[0], err);

    assert.equal(this.fakeSocket.destroy.callCount, 1);
  },

  'connect() calls back on success': function() {
    var fakeCb = sinon.spy();
    this.stream.connect(fakeCb);

    assert.equal(fakeCb.callCount, 0);

    this.fakeSocket.emit('connect');
    assert.equal(fakeCb.callCount, 1);
    assert.equal(fakeCb.getCall(0).args[0], null);
  },

  'connect() calls back on error': function() {
    var fakeCb = sinon.spy();
    this.stream.connect(fakeCb);

    assert.equal(fakeCb.callCount, 0);

    var fakeErr = new Error('something bad');
    this.fakeSocket.emit('error', fakeErr);
    assert.equal(fakeCb.callCount, 1);
    assert.strictEqual(fakeCb.getCall(0).args[0], fakeErr);
  },

  'connect() callback is optional': function() {
    this.stream.connect();
    this.fakeSocket.emit('connect');
  },

  'proxies "data" events': function() {
    var fakeData1 = new Buffer('abc');
    var fakeData2 = new Buffer('efg');

    var dataSpy = sinon.spy();
    this.stream.on('data', dataSpy);
    this.stream.connect();

    this.fakeSocket.emit('data', fakeData1);
    assert.strictEqual(dataSpy.callCount, 1);
    assert.strictEqual(dataSpy.getCall(0).args[0], fakeData1);

    this.fakeSocket.emit('data', fakeData2);
    assert.strictEqual(dataSpy.callCount, 2);
    assert.strictEqual(dataSpy.getCall(1).args[0], fakeData2);
  },

  'end() ends the socket gracefully': function() {
    this.stream.end();
    assert.equal(this.fakeSocket.end.callCount, 1);
  },

  'emits an "error" on unexpected server FIN': function() {
    var errorSpy = sinon.spy();
    var closeSpy = sinon.spy();

    this.stream.on('error', errorSpy);
    this.stream.on('close', closeSpy);

    this.stream.connect();

    this.fakeSocket.emit('end');

    assert.equal(errorSpy.callCount, 1);
    var err = errorSpy.getCall(0).args[0];
    assert.equal(err instanceof Error, true);
    assert.equal(/FIN/.test(err.message), true);

    assert.equal(closeSpy.callCount, 1);
    assert.strictEqual(closeSpy.getCall(0).args[0], err);
  },

  'proxies close event when expecting it': function() {
    var closeSpy = sinon.spy();
    this.stream.on('close', closeSpy);

    this.stream.connect();
    this.stream.end();
    this.fakeSocket.emit('end');

    assert.equal(closeSpy.callCount, 1);
    assert.equal(closeSpy.getCall(0).args[0], null);
  },
});

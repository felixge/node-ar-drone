var common           = require('../../common');
var assert           = require('assert');
var test             = require('utest');
var sinon            = require('sinon');
var UdpNavdataStream = require(common.lib + '/navdata/UdpNavdataStream');
var EventEmitter     = require('events').EventEmitter;

test('UdpNavdataStream', {
  before: function() {
    this.fakePort    = 18943;
    this.fakeIp      = '23.42.1776.20';
    this.fakeTimeout = 100;

    this.fakeSocket       = new EventEmitter();
    this.fakeSocket.bind  = sinon.stub();
    this.fakeSocket.send  = sinon.stub();
    this.fakeSocket.close = sinon.stub();

    this.fakeParser = sinon.stub();

    this.stream = new UdpNavdataStream({
      socket  : this.fakeSocket,
      port    : this.fakePort,
      ip      : this.fakeIp,
      parser  : this.fakeParser,
      timeout : this.fakeTimeout,
    });

    this.clock = sinon.useFakeTimers();
  },

  after: function() {
    this.clock.restore();
  },

  'is a readable stream': function() {
    assert.equal(this.stream.readable, true);
    assert.equal(typeof this.stream.pipe, 'function');
  },

  'resume() configures the socket': function() {
    this.stream.resume();

    // verify socket.bind()
    assert.equal(this.fakeSocket.bind.callCount, 1);

    // verify socket.send()
    assert.equal(this.fakeSocket.send.callCount, 1);
    var sendArgs = this.fakeSocket.send.getCall(0).args;
    var buffer   = sendArgs.shift();
    var offset   = sendArgs.shift();
    var length   = sendArgs.shift();
    var port     = sendArgs.shift();
    var ip       = sendArgs.shift();
    assert.equal(Buffer.isBuffer(buffer), true);
    assert.deepEqual(buffer, new Buffer([1]));
    assert.equal(offset, 0);
    assert.equal(length, buffer.length);
    assert.equal(port, this.fakePort);
    assert.equal(ip, this.fakeIp);
  },

  'calling resume() does not rebind socket, but requests navdata again': function() {
    this.stream.resume();
    this.stream.resume();

    assert.equal(this.fakeSocket.bind.callCount, 1);
    assert.equal(this.fakeSocket.send.callCount, 2);
  },

  'navdata is requested again after timeout': function() {
    this.stream.resume();
    assert.equal(this.fakeSocket.send.callCount, 1);

    this.clock.tick(this.fakeTimeout - 1);
    assert.equal(this.fakeSocket.send.callCount, 1);

    this.clock.tick(1);
    assert.equal(this.fakeSocket.send.callCount, 2);
  },

  'timeout is reset by navdata arriving': function() {
    this.stream.resume();

    this.clock.tick(this.fakeTimeout - 1);

    this.fakeParser.returns({});
    this.fakeSocket.emit('message', new Buffer(0));

    this.clock.tick(1);
    assert.equal(this.fakeSocket.send.callCount, 1);

    this.clock.tick(this.fakeTimeout);
    assert.equal(this.fakeSocket.send.callCount, 2);
  },

  'incoming messages are parsed': function() {
    var fakeBuffer  = new Buffer([1, 2, 3]);
    var fakeNavdata = {fake: 'navdata', sequenceNumber: 1};
    var dataSpy     = sinon.spy();

    this.fakeParser.returns(fakeNavdata);

    this.stream.on('data', dataSpy);

    this.stream.resume();
    this.fakeSocket.emit('message', fakeBuffer);

    assert.equal(this.fakeParser.callCount, 1);
    assert.strictEqual(this.fakeParser.getCall(0).args[0], fakeBuffer);

    assert.equal(dataSpy.callCount, 1);
    assert.strictEqual(dataSpy.getCall(0).args[0], fakeNavdata);
  },

  'old navdata messages are ignored': function() {
    var fakeNavdataA = {sequenceNumber: 1};
    var fakeNavdataB = {sequenceNumber: 2};
    var fakeNavdataC = {sequenceNumber: 3};

    this.fakeParser.withArgs(1).returns(fakeNavdataA);
    this.fakeParser.withArgs(2).returns(fakeNavdataB);
    this.fakeParser.withArgs(3).returns(fakeNavdataC);

    var dataSpy = sinon.spy();
    this.stream.on('data', dataSpy);

    this.stream.resume();
    this.fakeSocket.emit('message', 1);
    this.fakeSocket.emit('message', 3);
    this.fakeSocket.emit('message', 2);

    assert.equal(this.fakeParser.callCount, 3);
    assert.equal(dataSpy.callCount, 2);

    assert.equal(dataSpy.getCall(0).args[0].sequenceNumber, 1);
    assert.equal(dataSpy.getCall(1).args[0].sequenceNumber, 3);
  },

  'navdata errors are ignored by default': function() {
    this.fakeParser.throws(new Error('bad'));

    var dataSpy = sinon.spy();
    this.stream.on('data', dataSpy);

    this.stream.resume();
    this.fakeSocket.emit('message', 1);

    assert.equal(this.fakeParser.callCount, 1);
    assert.equal(dataSpy.callCount, 0);
  },

  'navdata errors are emitted if there is an error handler': function() {
    var fakeErr = new Error('bad');
    this.fakeParser.throws(fakeErr);

    var dataSpy = sinon.spy();
    var errorSpy = sinon.spy();

    this.stream.on('data', dataSpy);
    this.stream.on('error', errorSpy);

    this.stream.resume();
    this.fakeSocket.emit('message', 1);

    assert.equal(this.fakeParser.callCount, 1);
    assert.equal(dataSpy.callCount, 0);
    assert.equal(errorSpy.callCount, 1);
    assert.strictEqual(errorSpy.getCall(0).args[0], fakeErr);
  },

  'destroy() cleans up': function() {
    this.stream.destroy();
    assert.equal(this.fakeSocket.close.callCount, 1);
  },
});

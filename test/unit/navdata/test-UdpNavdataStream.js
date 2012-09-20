var common           = require('../../common');
var assert           = require('assert');
var test             = require('utest');
var sinon            = require('sinon');
var UdpNavdataStream = require(common.lib + '/navdata/UdpNavdataStream');
var EventEmitter     = require('events').EventEmitter;

test('UdpNavdataStream', {
  before: function() {
    this.fakePort = 18943;
    this.fakeIp   = '23.42.1776.20';

    this.fakeSocket       = new EventEmitter();
    this.fakeSocket.bind  = sinon.stub();
    this.fakeSocket.send  = sinon.stub();
    this.fakeSocket.close = sinon.stub();

    this.fakeParser = sinon.stub();

    this.stream = new UdpNavdataStream({
      socket : this.fakeSocket,
      port   : this.fakePort,
      ip     : this.fakeIp,
      parser : this.fakeParser,
    });
  },

  'is a readable stream': function() {
    assert.equal(this.stream.readable, true);
    assert.equal(typeof this.stream.pipe, 'function');
  },

  'resume() configures the socket': function() {
    this.stream.resume();

    // verify socket.bind()
    assert.equal(this.fakeSocket.bind.callCount, 1);
    assert.equal(this.fakeSocket.bind.getCall(0).args[0], this.fakePort);

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

  'calling resume() twice does nothing': function() {
    this.stream.resume();
    this.stream.resume();

    assert.equal(this.fakeSocket.bind.callCount, 1);
    assert.equal(this.fakeSocket.send.callCount, 1);
  },

  'incoming messages are parsed': function() {
    var fakeBuffer  = new Buffer([1, 2, 3]);
    var fakeNavdata = {fake: 'navdata'};
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

  'destroy() cleans up': function() {
    this.stream.destroy();
    assert.equal(this.fakeSocket.close.callCount, 1);
  },
});

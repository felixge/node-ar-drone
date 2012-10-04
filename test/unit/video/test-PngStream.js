var common         = require('../../common');
var assert         = require('assert');
var test           = require('utest');
var sinon          = require('sinon');
var PngStream      = require(common.lib + '/video/PngStream');
var TcpVideoStream = PngStream.TcpVideoStream;
var PngEncoder     = PngStream.PngEncoder;

test('PngStream', {
  before: function() {
    PngStream.TcpVideoStream = sinon.stub();
    PngStream.PngEncoder     = sinon.stub();

    this.tcpVideoStream = new TcpVideoStream();
    this.pngEncoder     = new PngEncoder();

    PngStream.TcpVideoStream.returns(this.tcpVideoStream);
    PngStream.PngEncoder.returns(this.pngEncoder);

    this.fakeOptions = {};
    this.stream = new PngStream(this.fakeOptions);
  },

  'is a readable stream': function() {
    assert.equal(this.stream.readable, true);
    assert.equal(typeof this.stream.pipe, 'function');
  },

  'resume connects new TcpVideoStream': function() {
    sinon.stub(this.tcpVideoStream, 'connect');

    this.stream.resume();

    assert.equal(PngStream.TcpVideoStream.callCount, 1);
    assert.strictEqual(PngStream.TcpVideoStream.getCall(0).args[0], this.fakeOptions);
    assert.equal(this.tcpVideoStream.connect.callCount, 1);
  },

  'resume passes TcpVideoStream data through PngEncoder': function() {
    sinon.stub(this.tcpVideoStream, 'connect');

    this.stream.resume();

    assert.equal(PngStream.TcpVideoStream.callCount, 1);
    assert.equal(PngStream.PngEncoder.callCount, 1);

    assert.strictEqual(PngStream.TcpVideoStream.getCall(0).args[0], this.fakeOptions);
    assert.strictEqual(PngStream.PngEncoder.getCall(0).args[0], this.fakeOptions);

    sinon.stub(this.pngEncoder, 'write');

    var fakeData = new Buffer([1]);
    this.tcpVideoStream.emit('data', fakeData);

    assert.equal(this.pngEncoder.write.callCount, 1);
    assert.strictEqual(this.pngEncoder.write.getCall(0).args[0], fakeData);

    var dataStub = sinon.stub();
    this.stream.on('data', dataStub);

    var fakePng = new Buffer([2]);
    this.pngEncoder.emit('data', fakePng);

    assert.equal(dataStub.callCount, 1);
    assert.strictEqual(dataStub.getCall(0).args[0], fakePng);
  },

  'TcpVideoStream stream errors cause a new tcpVideoStream to be created': function() {
    sinon.stub(this.tcpVideoStream, 'connect');
    sinon.stub(this.pngEncoder, 'end');

    this.stream.resume();

    var tcpVideoStream2 = new TcpVideoStream();
    sinon.stub(tcpVideoStream2, 'connect');
    PngStream.TcpVideoStream.returns(tcpVideoStream2);

    var fakeErr = new Error('bad shit');
    this.tcpVideoStream.emit('error', fakeErr);

    assert.equal(tcpVideoStream2.connect.callCount, 1);
    assert.equal(this.pngEncoder.end.callCount, 1);
  },

  'emits "error" events if there is a listener': function() {
    sinon.stub(this.tcpVideoStream, 'connect');
    sinon.stub(this.pngEncoder, 'end');

    var errStub = sinon.stub();
    this.stream.on('error', errStub);
    this.stream.resume();

    var fakeErr = new Error('bad shit');
    this.tcpVideoStream.emit('error', fakeErr);

    assert.equal(errStub.callCount, 1);
    assert.strictEqual(errStub.getCall(0).args[0], fakeErr);
  },
});

var common = require('../../common');
var assert = require('assert');
var sinon = require('sinon');
var test = require('utest');
var createUdpNavdataStream = require(common.lib + '/navdata/udpNavdataStream');

test('udpNavdataStream', {
  before: function() {
    this.stream = createUdpNavdataStream({paused: true});
    this.socket = this.stream.socket;
    this.config = this.stream.config;
    this.clock = sinon.useFakeTimers();

    sinon.stub(this.socket, 'send');
    sinon.stub(this.socket, 'bind');
  },

  after: function() {
    this.clock.restore();
  },

  'readable stream interface': function() {
    assert.strictEqual(this.stream.readable, true);
    assert.strictEqual(typeof this.stream.pipe, 'function');
  },

  'resume: binds the socket on first call': function() {
    this.stream.resume();

    assert.strictEqual(this.socket.bind.callCount, 1);
    assert.equal(this.socket.bind.lastCall.args.length, 0);

    this.stream.resume();
    assert.strictEqual(this.socket.bind.callCount, 1);
  },

  'resume: proxies socket "message" events as data events': function() {
    this.stream.resume();

    var dataSpy = sinon.spy();
    this.stream.on('data', dataSpy);

    this.socket.emit('message', 'A');
    this.socket.emit('message', 'B');

    assert.strictEqual(dataSpy.callCount, 2);
    assert.deepEqual(dataSpy.getCall(0).args, ['A']);
    assert.deepEqual(dataSpy.getCall(1).args, ['B']);
  },

  'resume: requests navdata by sending a 0x01 byte': function() {
    this.stream.resume();

    assert.strictEqual(this.socket.send.callCount, 1);
    var args = this.socket.send.lastCall.args;
    assert.deepEqual(args[0], new Buffer([0x01]));
    assert.strictEqual(args[1], 0);
    assert.strictEqual(args[2], args[0].length);
    assert.strictEqual(args[3], this.config.navdataPort);
    assert.strictEqual(args[4], this.config.ip);
  },

  'resume: re-requests navdata after timeout': function() {
    this.stream.resume();

    this.clock.tick(this.config.navdataTimeout);
    assert.strictEqual(this.socket.send.callCount, 2);

    this.clock.tick(this.config.navdataTimeout);
    assert.strictEqual(this.socket.send.callCount, 3);
  },
});

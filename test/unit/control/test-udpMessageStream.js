var common = require('../../common');
var assert = require('assert');
var test = require('utest');
var sinon = require('sinon');
var udpMessageStream = require(common.lib + '/control/udpMessageStream');
var message = require(common.lib + '/control/message');

test('udpMessageStream', {
  before: function() {
    this.stream = udpMessageStream();
    this.config = this.stream.config;
    this.socket = this.stream.socket;
  },

  'writable stream interface': function() {
    assert.strictEqual(this.stream.writable, true);
    assert.strictEqual(typeof this.stream.on, 'function');
    assert.strictEqual(typeof this.stream.write, 'function');
  },

  'write(): takes an AtMessage and sends it via udp': function() {
    var fakeString = 'foobar';
    var msg = message();

    sinon.stub(this.socket, 'send');
    sinon.stub(message, 'toString').returns(fakeString);

    this.stream.write(message);

    assert.equal(this.socket.send.callCount, 1);
    var args = this.socket.send.getCall(0).args;

    assert.ok(Buffer.isBuffer(args[0]));
    assert.deepEqual(args[0], new Buffer(fakeString));
    assert.strictEqual(args[1], 0);
    assert.strictEqual(args[2], fakeString.length);
    assert.strictEqual(args[3], this.config.atPort);
    assert.strictEqual(args[4], this.config.ip);
  },
});

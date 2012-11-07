var common                   = require('../../common');
var assert                   = require('assert');
var test                     = require('utest');
var sinon                    = require('sinon');
var createUdpMessageStream = require(common.lib + '/control/createUdpMessageStream');
var createMessage          = require(common.lib + '/control/createMessage');

test('createUdpMessageStream', {
  before: function() {
    this.stream = createUdpMessageStream();
    this.config = this.stream.config;
    this.socket = this.stream.socket;
  },

  'write(): takes an AtMessage and sends it via udp': function() {
    var fakeString = 'foobar';
    var message = createMessage();

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

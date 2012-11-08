var common = require('../common');
var assert = require('assert');
var test = require('utest');
var sinon = require('sinon');
var fs = require('fs');
var createNavdata = require(common.lib + '/navdata');
var createMessage = require(common.lib + '/navdata/message');
var createUdpNavdataStream = require(common.lib + '/navdata/udpNavdataStream');
var fixture = fs.readFileSync(common.fixtures + '/navdata.bin');

test('navdata', {
  before: function() {
    this.udpStream = createUdpNavdataStream({paused: true});
    this.navdata = createNavdata({udpStream: this.udpStream});
    this.log = this.navdata.log;

    sinon.stub(this.log, 'write');
  },

  'has all sensor data properties': function() {
    var message = createMessage();

    // do a shallow check
    for (var key in message) {
      assert.ok(key in this.navdata, key);
    }
  },

  'readable stream interface': function() {
    assert.strictEqual(this.navdata.readable, true);
    assert.strictEqual(typeof this.navdata.pipe, 'function');
  },

  'writable stream interface': function() {
    assert.strictEqual(this.navdata.writable, true);
    assert.strictEqual(typeof this.navdata.write, 'function');
  },

  'parses udpStream buffers': function() {
    var dataSpy = sinon.spy();;
    this.navdata.on('data', dataSpy);
    this.udpStream.emit('data', fixture);

    assert.strictEqual(dataSpy.callCount, 1);
    var message = dataSpy.lastCall.args[0];
    assert.strictEqual(message.controlState, 'landed');
  },

  'write: logs unknown headers': function() {
    var dataSpy = sinon.spy();;
    this.navdata.on('data', dataSpy);
    var badNavdata = new Buffer([1,2,3,4]);
    this.udpStream.emit('data', badNavdata);

    assert.strictEqual(this.log.write.callCount, 1);
    assert.strictEqual(dataSpy.callCount, 0);
  },

  'write: catches and logs exceptions': function() {
    var dataSpy = sinon.spy();;
    this.navdata.on('data', dataSpy);
    var badNavdata = fixture.slice(0, 10);
    this.udpStream.emit('data', badNavdata);

    assert.strictEqual(this.log.write.callCount, 1);
    assert.strictEqual(dataSpy.callCount, 0);
  },
});

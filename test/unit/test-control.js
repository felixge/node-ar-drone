var common = require('../common');
var assert = require('assert');
var test = require('utest');
var sinon = require('sinon');
var createControl = require(common.lib + '/control');
var createMessage = require(common.lib + '/control/message');
var createNavdata = require(common.lib + '/navdata/message');

test('control', {
  before: function() {
    this.clock = sinon.useFakeTimers();
    this.control = createControl();
    this.config = this.control.config;
    this.udpMessageStream = this.control.udpMessageStream;
    this.commandStream = this.control.commandStream;
    this.log = this.control.log;

    sinon.stub(this.log, 'write');
    sinon.stub(this.udpMessageStream, 'write');
  },

  after: function() {
    this.clock.restore();
  },

  'constructor': function() {
    assert.equal(this.control.fly, false);
    assert.equal(this.control.emergency, false);
    assert.equal(this.control.leftRight, 0);
    assert.equal(this.control.frontBack, 0);
    assert.equal(this.control.upDown, 0);
    assert.equal(this.control.clockSpin, 0);
  },

  'writable stream interface': function() {
    assert.strictEqual(this.control.writable, true);
    assert.strictEqual(typeof this.control.on, 'function');
    assert.strictEqual(typeof this.control.write, 'function');
  },

  'readable stream interface': function() {
    assert.strictEqual(this.control.readable, true);
    assert.strictEqual(typeof this.control.pipe, 'function');
  },

  'sends next message to udp stream every config.timeout': function() {
    var dataSpy = sinon.spy();
    this.control.on('data', dataSpy);

    this.control.resume();
    this.control.fly = true;
    this.control.upDown = 1;

    this.clock.tick(this.config.udpInterval);

    assert.equal(this.udpMessageStream.write.callCount, 1);
    var message = this.udpMessageStream.write.lastCall.args[0];

    assert.strictEqual(dataSpy.callCount, 1);
    assert.deepEqual(dataSpy.lastCall.args[0], this.control.toJSON());

    // Check the commands
    assert.strictEqual(message.commands[0].type, 'REF');
    assert.ok(message.commands[0].args[0]);
    assert.strictEqual(message.commands[1].type, 'PCMD');
    assert.ok(message.commands[1].args[0]);
  },

  'resume: disables emergency if there is one': function() {
    this.control.resume();

    var navdata = createNavdata();
    navdata.status.emergencyLanding = true;
    this.control.write(navdata);

    assert.strictEqual(this.control.emergency, true);

    navdata.status.emergencyLanding = false;
    this.control.write(navdata);
    assert.strictEqual(this.control.emergency, false);
  },

  'toJSON: returns a copy of just the data': function() {
    var json = this.control.toJSON();

    // check one value
    assert.strictEqual(json.leftRight, 0);

    // make sure modifying it does not modify the control
    json.leftRight = 5;
    assert.strictEqual(this.control.leftRight, 0);

    // also make sure functions were not copied
    assert.strictEqual(json.toJSON, undefined);

    // and out objects are not copied either
    assert.strictEqual(json.config, undefined);

    // and filters out private stuff
    assert.strictEqual(json._interval, undefined);

    // and filters out writable/readable
    assert.strictEqual(json.readable, undefined);
    assert.strictEqual(json.writable, undefined);
  },

  'write: missing "demo" options requests additional data': function() {
    sinon.stub(this.commandStream, 'config')
    sinon.stub(this.commandStream, 'flush')

    var navdata = createNavdata();
    this.control.write(navdata);

    assert.strictEqual(this.log.write.callCount, 1);
    assert.strictEqual(this.commandStream.config.callCount, 1);
    assert.strictEqual(this.commandStream.flush.callCount, 1);

    var configOptions = this.commandStream.config.lastCall.args[0];
    assert.strictEqual(configOptions.key, 'general:navdata_demo');
    assert.strictEqual(configOptions.value, 'TRUE');

    // no log entry is made the second time
    this.control.write(navdata);
    assert.strictEqual(this.log.write.callCount, 1);
    assert.strictEqual(this.commandStream.config.callCount, 2);
    assert.strictEqual(this.commandStream.flush.callCount, 2);

    // one log entry is made once we receive demo options
    navdata.options.push('demo');
    this.control.write(navdata);
    assert.strictEqual(this.log.write.callCount, 2);

    // second message won't trigger log again
    this.control.write(navdata);
    assert.strictEqual(this.log.write.callCount, 2);
  },
});

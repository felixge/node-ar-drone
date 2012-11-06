var common          = require('../common');
var assert          = require('assert');
var test            = require('utest');
var sinon           = require('sinon');
var createControl   = require(common.lib + '/createControl');
var createAtMessage = require(common.lib + '/control/createAtMessage');

test('createControl', {
  before: function() {
    this.control         = createControl();
    this.messageSequence = this.control.messageSequence;
  },

  'constructor': function() {
    assert.equal(this.control.fly, false);
    assert.equal(this.control.emergency, false);
    assert.equal(this.control.leftRight, 0);
    assert.equal(this.control.frontBack, 0);
    assert.equal(this.control.upDown, 0);
    assert.equal(this.control.clockSpin, 0);
  },

  'nextMessage: returns the next message in the sequence': function() {
    var message = createAtMessage();
    sinon.stub(this.messageSequence, 'next').returns(message);

    var returned = this.control.nextMessage();
    assert.strictEqual(returned, message);
  },

  'nextMessage: includes the right ref command': function() {
    this.control.fly = true;

    var message    = this.control.nextMessage();
    var refCommand = message.commands[0];

    assert.equal(refCommand.type, 'REF');
    assert.ok(refCommand.args[0]);
  },

  'nextMessage: includes the right pcmd command': function() {
    this.control.upDown = 1;

    var message    = this.control.nextMessage();
    var refCommand = message.commands[1];

    assert.equal(refCommand.type, 'PCMD');
    assert.ok(refCommand.args[0]);
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
  },
});

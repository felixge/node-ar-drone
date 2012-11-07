var common                       = require('../../common');
var assert                       = require('assert');
var test                         = require('utest');
var sinon                        = require('sinon');
var control                = require(common.lib + '/control');
var controlMessageSequence = require(common.lib + '/control/controlMessageSequence');
var message              = require(common.lib + '/control/message');

test('control', {
  before: function() {
    this.control         = control({paused: true});
    this.sequence        = controlMessageSequence();
    this.messageSequence = this.sequence.messageSequence;
    this.commandSequence = this.sequence.commandSequence;
  },

  'next: returns the next message in the sequence': function() {
    var msg = message();
    sinon.stub(this.messageSequence, 'next').returns(msg);

    var returned = this.sequence.next(this.control);
    assert.strictEqual(returned, msg);
  },

  'next: includes the right ref command': function() {
    this.control.fly = true;

    var message    = this.sequence.next(this.control);
    var refCommand = message.commands[0];

    assert.equal(refCommand.type, 'REF');
    assert.ok(refCommand.args[0]);
  },

  'next: includes the right pcmd command': function() {
    this.control.upDown = 1;

    var message    = this.sequence.next(this.control);
    var refCommand = message.commands[1];

    assert.equal(refCommand.type, 'PCMD');
    assert.ok(refCommand.args[0]);
  },
});

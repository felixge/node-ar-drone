var common                       = require('../../common');
var assert                       = require('assert');
var test                         = require('utest');
var sinon                        = require('sinon');
var createControl                = require(common.lib + '/createControl');
var createControlMessageSequence = require(common.lib + '/control/createControlMessageSequence');
var createMessage              = require(common.lib + '/control/createMessage');

test('createControl', {
  before: function() {
    this.control         = createControl({paused: true});
    this.sequence        = createControlMessageSequence();
    this.messageSequence = this.sequence.messageSequence;
    this.commandSequence = this.sequence.commandSequence;
  },

  'next: returns the next message in the sequence': function() {
    var message = createMessage();
    sinon.stub(this.messageSequence, 'next').returns(message);

    var returned = this.sequence.next(this.control);
    assert.strictEqual(returned, message);
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

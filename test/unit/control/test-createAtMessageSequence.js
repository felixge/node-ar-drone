var common                  = require('../../common');
var assert                  = require('assert');
var test                    = require('utest');
var createAtMessageSequence = require(common.lib + '/control/createAtMessageSequence');

test('createAtMessageSequence', {
  before: function() {
    this.sequence = createAtMessageSequence();
  },

  'next(): message numbers are incrementing': function() {
    assert.equal(this.sequence.next().number, 0);
    assert.equal(this.sequence.next().number, 1);
    assert.equal(this.sequence.next().number, 2);
  },

  'next(): commands array is being passed': function() {
    var message = this.sequence.next([1, 2, 3]);
    assert.equal(message.commands.length, 3);
    assert.deepEqual(message.commands, [1, 2, 3]);
  },
});

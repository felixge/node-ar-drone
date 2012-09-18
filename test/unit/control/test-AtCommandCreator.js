var common           = require('../../common');
var assert           = require('assert');
var test             = require('utest');
var AtCommandCreator = require(common.lib + '/control/AtCommandCreator');
var at               = require(common.lib + '/control/at');

test('AtCommandCreator', {
  'command.number keeps incrementing': function() {
    var writer = new AtCommandCreator();

    assert.equal(writer.ref().number, 0);
    assert.equal(writer.ref().number, 1);
    assert.equal(writer.ref().number, 2);
  },

  'raw': function() {
    var writer = new AtCommandCreator();

    var cmd = writer.raw('FOO', 1, 2, 3);
    assert.equal(cmd.type, 'FOO');
    assert.deepEqual(cmd.args, [1, 2, 3]);
  },

  'ref': function() {
    var writer = new AtCommandCreator();

    var cmd = writer.ref();
    assert.equal(cmd.type, 'REF');
    assert.equal(cmd.args.length, 1);
    assert.equal(cmd.args[0], 0);

    var cmd = writer.ref({takeoff: true});
    assert.ok(cmd.args[0] & (1 << 9));

    var cmd = writer.ref({emergency: true});
    assert.ok(cmd.args[0] & (1 << 8));
  },

  'pcmd': function() {
    var writer = new AtCommandCreator();

    var cmd = writer.pcmd();
    assert.equal(cmd.type, 'PCMD');
    assert.equal(cmd.args.length, 5);
    assert.deepEqual(cmd.args, [0, 0, 0, 0, 0]);

    var cmd = writer.pcmd({upDown: 0.9, leftRight: 0.8, frontBack: 0.7, clockWise: -0.5});
    assert.ok(cmd.args.shift() & (1 << 0));

    assert.equal(cmd.args.shift(), at.floatString(0.8));
    assert.equal(cmd.args.shift(), at.floatString(0.7));
    assert.equal(cmd.args.shift(), at.floatString(0.9));
    assert.equal(cmd.args.shift(), at.floatString(-0.5));
  },
});

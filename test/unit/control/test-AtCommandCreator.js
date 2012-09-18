var common           = require('../../common');
var assert           = require('assert');
var test             = require('utest');
var AtCommandCreator = require(common.lib + '/control/AtCommandCreator');
var at               = require(common.lib + '/control/at');

test('AtCommandCreator', {
  'command.number keeps incrementing': function() {
    var creator = new AtCommandCreator();

    assert.equal(creator.ref().number, 0);
    assert.equal(creator.ref().number, 1);
    assert.equal(creator.ref().number, 2);
  },

  'raw': function() {
    var creator = new AtCommandCreator();

    var cmd = creator.raw('FOO', 1, 2, 3);
    assert.equal(cmd.type, 'FOO');
    assert.deepEqual(cmd.args, [1, 2, 3]);

    // An array can be given as well
    var cmd = creator.raw('FOO', [1, 2, 3]);
    assert.equal(cmd.type, 'FOO');
    assert.deepEqual(cmd.args, [1, 2, 3]);
  },

  'ref': function() {
    var creator = new AtCommandCreator();

    var cmd = creator.ref();
    assert.equal(cmd.type, 'REF');
    assert.equal(cmd.args.length, 1);
    assert.equal(cmd.args[0], 0);

    var cmd = creator.ref({takeoff: true});
    assert.ok(cmd.args[0] & (1 << 9));

    var cmd = creator.ref({emergency: true});
    assert.ok(cmd.args[0] & (1 << 8));
  },

  'pcmd': function() {
    var creator = new AtCommandCreator();

    var cmd = creator.pcmd();
    assert.equal(cmd.type, 'PCMD');
    assert.equal(cmd.args.length, 5);
    assert.deepEqual(cmd.args, [0, 0, 0, 0, 0]);

    // test all the aliases mapping to pcmd args
    var val = 0.75;
    assert.equal(creator.pcmd({left: val}).args[1], at.floatString(-val));
    assert.equal(creator.pcmd({right: val}).args[1], at.floatString(val));
    assert.equal(creator.pcmd({front: val}).args[2], at.floatString(-val));
    assert.equal(creator.pcmd({back: val}).args[2], at.floatString(val));
    assert.equal(creator.pcmd({up: val}).args[3], at.floatString(val));
    assert.equal(creator.pcmd({down: val}).args[3], at.floatString(-val));
    assert.equal(creator.pcmd({clockwise: val}).args[4], at.floatString(val));
    assert.equal(creator.pcmd({counterclockwise: val}).args[4], at.floatString(-val));

    // test multiple aliases togeter
    var cmd = creator.pcmd({left: 0.1, clockwise: 0.3});
    assert.equal(cmd.args[1], at.floatString(-0.1));
    assert.equal(cmd.args[4], at.floatString(0.3));
  },
});

var common          = require('../../common');
var assert          = require('assert');
var test            = require('utest');
var AtCommandWriter = require(common.lib + '/control/AtCommandWriter');

test('AtCommandWriter', {
  'command.number keeps incrementing': function() {
    var writer = new AtCommandWriter();

    assert.equal(writer.ref().number, 0);
    assert.equal(writer.ref().number, 1);
    assert.equal(writer.ref().number, 2);
  },

  'ref': function() {
    var writer = new AtCommandWriter();

    var cmd = writer.ref();
    assert.equal(cmd.type, 'REF');
    assert.equal(cmd.args.length, 1);
    assert.equal(cmd.args[0], 0);

    var cmd = writer.ref({takeoff: true});
    assert.ok(cmd.args[0] & (1 << 9));

    var cmd = writer.ref({emergency: true});
    assert.ok(cmd.args[0] & (1 << 8));
  },
});

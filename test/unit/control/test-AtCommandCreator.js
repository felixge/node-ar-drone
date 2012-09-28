var common           = require('../../common');
var assert           = require('assert');
var test             = require('utest');
var AtCommandCreator = require(common.lib + '/control/AtCommandCreator');
var at               = require(common.lib + '/control/at');

test('AtCommandCreator', {
  before: function() {
    this.creator = new AtCommandCreator();
  },

  'command.number keeps incrementing': function() {
    assert.equal(this.creator.ref().number, 0);
    assert.equal(this.creator.ref().number, 1);
    assert.equal(this.creator.ref().number, 2);
  },

  'raw': function() {
    var cmd = this.creator.raw('FOO', 1, 2, 3);
    assert.equal(cmd.type, 'FOO');
    assert.deepEqual(cmd.args, [1, 2, 3]);

    // An array can be given as well
    var cmd = this.creator.raw('FOO', [1, 2, 3]);
    assert.equal(cmd.type, 'FOO');
    assert.deepEqual(cmd.args, [1, 2, 3]);
  },

  'ref': function() {
    var cmd = this.creator.ref();
    assert.equal(cmd.type, 'REF');
    assert.equal(cmd.args.length, 1);
    assert.equal(cmd.args[0], 0);

    var cmd = this.creator.ref({fly: true});
    assert.ok(cmd.args[0] & AtCommandCreator.REF_FLAGS.takeoff);

    var cmd = this.creator.ref({emergency: true});
    assert.ok(cmd.args[0] & AtCommandCreator.REF_FLAGS.emergency);
  },

  'pcmd': function() {
    var cmd = this.creator.pcmd();
    assert.equal(cmd.type, 'PCMD');
    assert.equal(cmd.args.length, 5);
    assert.deepEqual(cmd.args, [0, 0, 0, 0, 0]);

    // test all the aliases mapping to pcmd args
    var val = 0.75;
    assert.equal(this.creator.pcmd({left: val}).args[1], at.floatString(-val));
    assert.equal(this.creator.pcmd({right: val}).args[1], at.floatString(val));
    assert.equal(this.creator.pcmd({front: val}).args[2], at.floatString(-val));
    assert.equal(this.creator.pcmd({back: val}).args[2], at.floatString(val));
    assert.equal(this.creator.pcmd({up: val}).args[3], at.floatString(val));
    assert.equal(this.creator.pcmd({down: val}).args[3], at.floatString(-val));
    assert.equal(this.creator.pcmd({clockwise: val}).args[4], at.floatString(val));
    assert.equal(this.creator.pcmd({counterClockwise: val}).args[4], at.floatString(-val));

    // test multiple aliases togeter
    var cmd = this.creator.pcmd({left: 0.1, clockwise: 0.3});
    assert.equal(cmd.args[1], at.floatString(-0.1));
    assert.equal(cmd.args[4], at.floatString(0.3));

    // test progressive bit being unset when no aliases are provided
    var cmd = this.creator.pcmd();
    assert.equal(cmd.args[0] & AtCommandCreator.PCMD_FLAGS.progressive, false);

    // test progressive bit being set automatically
    var cmd = this.creator.pcmd({left: 0.1});
    assert.ok(cmd.args[0] & (1 << 0));
  },

  'config': function() {
    var cmd = this.creator.config('foo', 'bar');
    assert.equal(cmd.type, 'CONFIG');
    assert.equal(cmd.args.length, 2);
    assert.equal(cmd.args[0], '"foo"');
    assert.equal(cmd.args[1], '"bar"');
  },

  'animateLeds() works as expected': function() {
    var hz = 3;
    var duration = 3;

    var cmd      = this.creator.animateLeds('blinkGreen', hz, duration);
    var expected = '1,' + at.floatString(hz) + ',' + duration;

    assert.equal(cmd.type, 'CONFIG');
    assert.equal(cmd.args.length, 2);
    assert.equal(cmd.args[0], '"leds:leds_anim"');
    assert.equal(cmd.args[1], '"' + expected + '"');
  },

  'animateLeds() does a red snake at 2 hz for 3s by default': function() {
    var cmd      = this.creator.animateLeds();
    var expected = '9,' + at.floatString(2) + ',' + 3;
    assert.equal(cmd.args[1], '"' + expected + '"');
  },

  'animateLeds() throws an error for unknown animations': function() {
    var self = this;
    assert.throws(function() {
      self.creator.animateLeds('does not exist');
    },/animation/);
  },

  'animate() works as expected': function() {
    var duration = 2000;
    var cmd      = this.creator.animate('yawShake', duration);
    var expected = '8,' + duration;

    assert.equal(cmd.type, 'CONFIG');
    assert.equal(cmd.args.length, 2);
    assert.equal(cmd.args[0], '"control:flight_anim"');
    assert.equal(cmd.args[1], '"' + expected + '"');
  },

  'animate() throws an error for unknown animations': function() {
    var self = this;
    assert.throws(function() {
      self.creator.animate('does not exist');
    },/animation/);
  },
});

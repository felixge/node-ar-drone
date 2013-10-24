var common           = require('../../common');
var assert           = require('assert');
var test             = require('utest');
var AtCommandCreator = require(common.lib + '/control/AtCommandCreator');
var at               = require(common.lib + '/control/at');

test('AtCommandCreator', {
  before: function() {
    this.creator = new AtCommandCreator();
  },

  'raw': function() {
    var cmd = this.creator.raw('FOO', [1, 2, 3]);
    assert.equal(cmd.type, 'FOO');
    assert.deepEqual(cmd.args, [1, 2, 3]);
    assert.equal(cmd.blocks, false);
    assert.deepEqual(cmd.options, {});
    assert(!cmd.callback);

    var options = { timeout: 10 };
    cmd = this.creator.raw('FOO', [1, 2], true, options);
    assert.equal(cmd.type, 'FOO');
    assert.deepEqual(cmd.args, [1, 2]);
    assert.equal(cmd.blocks, true);
    assert.deepEqual(cmd.options, options);
    assert(!cmd.callback);

    options = { timeout: 10 };
    var callback = function() {};
    cmd = this.creator.raw('FOO', [1, 2], true, options, callback);
    assert.equal(cmd.type, 'FOO');
    assert.deepEqual(cmd.args, [1, 2]);
    assert.equal(cmd.blocks, true);
    assert.deepEqual(cmd.options, options);
    assert.equal(cmd.callback, callback);
  },

  'ctrl': function() {
    var cmd = this.creator.ctrl(5, 0);
    assert.equal(cmd.type, 'CTRL');
    assert.equal(cmd.args.length, 2);
    assert.equal(cmd.args[0], 5);
    assert.equal(cmd.args[1], 0);
    assert.equal(cmd.blocks, false);
    assert.deepEqual(cmd.options, {});
    assert(!cmd.callback);
  },

  'ref': function() {
    var cmd = this.creator.ref();
    assert.equal(cmd.type, 'REF');
    assert.equal(cmd.args.length, 1);
    assert.equal(cmd.args[0], 0);
    assert.equal(cmd.blocks, false);
    assert.deepEqual(cmd.options, {});

    cmd = this.creator.ref({fly: true});
    assert.ok(cmd.args[0] & AtCommandCreator.REF_FLAGS.takeoff);
    assert.equal(cmd.blocks, false);
    assert.deepEqual(cmd.options, {});

    cmd = this.creator.ref({emergency: true});
    assert.ok(cmd.args[0] & AtCommandCreator.REF_FLAGS.emergency);
    assert.equal(cmd.blocks, false);
    assert.deepEqual(cmd.options, {});
  },

  'pcmd': function() {
    var cmd = this.creator.pcmd();
    assert.equal(cmd.type, 'PCMD');
    assert.equal(cmd.args.length, 5);
    assert.deepEqual(cmd.args, [0, 0, 0, 0, 0]);
    assert.equal(cmd.blocks, false);
    assert.deepEqual(cmd.options, {});

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
    cmd = this.creator.pcmd({left: 0.1, clockwise: 0.3});
    assert.equal(cmd.args[1], at.floatString(-0.1));
    assert.equal(cmd.args[4], at.floatString(0.3));

    // test progressive bit being unset when no aliases are provided
    cmd = this.creator.pcmd();
    assert.equal(cmd.args[0] & AtCommandCreator.PCMD_FLAGS.progressive, false);

    // test progressive bit being set automatically
    cmd = this.creator.pcmd({left: 0.1});
    assert.ok(cmd.args[0] & (1 << 0));
  },

  'calibrate': function() {
    var cmd = this.creator.calibrate(0);
    assert.equal(cmd.type, 'CALIB');
    assert.equal(cmd.args.length, 1);
    assert.equal(cmd.args[0], '0');
    assert.equal(cmd.blocks, false);
    assert.deepEqual(cmd.options, {});
    cmd = this.creator.calibrate(1);
    assert.equal(cmd.type, 'CALIB');
    assert.equal(cmd.args.length, 1);
    assert.equal(cmd.args[0], '1');
    assert.equal(cmd.blocks, false);
  },

  'config': function() {
    var cmd = this.creator.config('foo', 'bar');
    assert.equal(cmd.type, 'CONFIG');
    assert.equal(cmd.args.length, 2);
    assert.equal(cmd.args[0], '"foo"');
    assert.equal(cmd.args[1], '"bar"');
    assert.equal(cmd.blocks, true);
    assert.deepEqual(cmd.options, {});

    var callback = function() {};
    cmd = this.creator.config('foo', 'bar', callback);
    assert.equal(cmd.type, 'CONFIG');
    assert.equal(cmd.args.length, 2);
    assert.equal(cmd.args[0], '"foo"');
    assert.equal(cmd.args[1], '"bar"');
    assert.equal(cmd.blocks, true);
    assert.deepEqual(cmd.options, {});
    assert.equal(cmd.callback, callback);

    cmd = this.creator.config({key: 'foo', value: 'bar'});
    assert.equal(cmd.type, 'CONFIG');
    assert.equal(cmd.args.length, 2);
    assert.equal(cmd.args[0], '"foo"');
    assert.equal(cmd.args[1], '"bar"');
    assert.equal(cmd.blocks, true);

    cmd = this.creator.config({key: 'foo', value: 'bar', timeout: 1}, callback);
    assert.equal(cmd.type, 'CONFIG');
    assert.equal(cmd.args.length, 2);
    assert.equal(cmd.args[0], '"foo"');
    assert.equal(cmd.args[1], '"bar"');
    assert.equal(cmd.blocks, true);
    assert.equal(cmd.options.timeout, 1);
    assert.equal(cmd.callback, callback);
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
    assert.equal(cmd.blocks, true);
    assert(!cmd.options.callback);
    assert(!cmd.options.timeout);
  },

  'animateLeds() does a red snake at 2 hz for 3s by default': function() {
    var cmd      = this.creator.animateLeds();
    var expected = '9,' + at.floatString(2) + ',' + 3;
    assert.equal(cmd.args[1], '"' + expected + '"');
    assert.equal(cmd.blocks, true);
    assert(!cmd.options.callback);
    assert(!cmd.options.timeout);
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

  'ftrim': function() {
    var cmd = this.creator.ftrim();
    assert.equal(cmd.type, 'FTRIM');
    assert.equal(cmd.args.length, 0);
    assert.equal(cmd.blocks, false);
    assert.deepEqual(cmd.options, {});
  },
});

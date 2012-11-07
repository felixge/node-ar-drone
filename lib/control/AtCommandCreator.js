var AtCommand = require('./AtCommand');
var at = require('./at');

var exports = module.exports = AtCommandCreator;
function AtCommandCreator() {
  this._number = 0;
}

AtCommandCreator.prototype.raw = function(type, args) {
  args = (Array.isArray(args))
    ? args
    : Array.prototype.slice.call(arguments, 1);

  return new AtCommand(type, this._number++, args);
};

// Used for fly/land as well as emergency trigger/recover
AtCommandCreator.prototype.ref = function(options) {
  options = options || {};

  var args = [0];

  if (options.flyBit) {
    args[0] = args[0] | REF_FLAGS.takeoff;
  }

  if (options.emergencyBit) {
    args[0] = args[0] | REF_FLAGS.emergency;
  }

  return this.raw('REF', args);
};

// Used to fly the drone around
AtCommandCreator.prototype.pcmd = function(options) {
  options = options || {};

  var args = [
    0,
    at.floatString(options.leftRight),
    at.floatString(options.frontBack),
    at.floatString(options.upDown),
    at.floatString(options.clockSpin),
  ];

  // determine if the drone is supposed to move or not
  var move = args.some(function(value) {
    return value !== 0;
  });

  if (move) {
    args[0] = args[0] | PCMD_FLAGS.progressive;
  }

  return this.raw('PCMD', args);
};

AtCommandCreator.prototype.config = function(name, value) {
  return this.raw('CONFIG', '"' + name + '"', '"' + value + '"');
};

AtCommandCreator.prototype.animateLeds = function(name, hz, duration) {
  // Default animation
  name = name || 'redSnake';
  hz = hz || 2;
  duration = duration || 3;

  var animationId = LED_ANIMATIONS.indexOf(name);
  if (animationId < 0) {
    throw new Error('Unknown led animation: ' + name);
  }

  hz = at.floatString(hz);

  var params = [animationId, hz, duration].join(',');
  return this.config('leds:leds_anim', params);
};

AtCommandCreator.prototype.animate = function(name, duration) {
  var animationId = ANIMATIONS.indexOf(name);
  if (animationId < 0) {
    throw new Error('Unknown animation: ' + name);
  }

  var params = [animationId, duration].join(',');
  return this.config('control:flight_anim', params);
};

// Constants

var REF_FLAGS = exports.REF_FLAGS = {
  emergency : (1 << 8),
  takeoff   : (1 << 9),
};

var PCMD_FLAGS = exports.PCMD_FLAGS = {
  progressive : (1 << 0),
};

// from ARDrone_SDK_2_0/ControlEngine/iPhone/Release/ARDroneGeneratedTypes.h
var LED_ANIMATIONS = exports.LED_ANIMATIONS = [
  'blinkGreenRed',
  'blinkGreen',
  'blinkRed',
  'blinkOrange',
  'snakeGreenRed',
  'fire',
  'standard',
  'red',
  'green',
  'redSnake',
  'blank',
  'rightMissile',
  'leftMissile',
  'doubleMissile',
  'frontLeftGreenOthersRed',
  'frontRightGreenOthersRed',
  'rearRightGreenOthersRed',
  'rearLeftGreenOthersRed',
  'leftGreenRightRed',
  'leftRedRightGreen',
  'blinkStandard',
];

// from ARDrone_SDK_2_0/ControlEngine/iPhone/Release/ARDroneGeneratedTypes.h
var ANIMATIONS = exports.ANIMATIONS = [
  'phiM30Deg',
  'phi30Deg',
  'thetaM30Deg',
  'theta30Deg',
  'theta20degYaw200deg',
  'theta20degYawM200deg',
  'turnaround',
  'turnaroundGodown',
  'yawShake',
  'yawDance',
  'phiDance',
  'thetaDance',
  'vzDance',
  'wave',
  'phiThetaMixed',
  'doublePhiThetaMixed',
  'flipAhead',
  'flipBehind',
  'flipLeft',
  'flipRight',
];

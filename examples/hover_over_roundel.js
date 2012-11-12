var arDrone                = require('ar-drone');
var constants              = require('ar-drone/lib/constants');
var maskingFunctions       = require('ar-drone/lib/navdata/maskingFunctions');
var maskFromNavdataOptions = maskingFunctions.maskFromNavdataOptions;

// get a reference to the drone
var drone = arDrone.createClient();

// log all errors
drone.on('error', function (err) {
  console.log('ERROR:', err);
});

// increase the frequency of the navadata updates
drone.config('general:navdata_demo', 'FALSE');

// control the keys in the navdata
var optionsMask = maskFromNavdataOptions(
  constants.options.DEMO,
  constants.options.VISION_DETECT,
  constants.options.EULER_ANGLES
);
drone.config('general:navdata_options', optionsMask);

// detect multiple tag types
drone.config('detect:detect_type', constants.CAD_TYPE.ORIENTED_ROUNDEL);

// set the drone's "flying mode"
var flyingMode = constants.FLYING_MODE.HOVER_ON_TOP_OF_ORIENTED_ROUNDEL;
drone.config('control:flying_mode', flyingMode);

// set the altitude where the drone should hover
var millimeters = 1000;
drone.config('control:hovering_range', millimeters);

// log navdata
drone.on('navdata', console.log);

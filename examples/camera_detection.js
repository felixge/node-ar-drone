var arDrone                = require('ar-drone');
var constants              = require('ar-drone/lib/constants');
var maskingFunctions       = require('ar-drone/lib/navdata/maskingFunctions');
var TAG_TYPE_MASK          = maskingFunctions.TAG_TYPE_MASK;
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
drone.config('detect:detect_type', constants.CAD_TYPE.MULTIPLE_DETECTION_MODE);

// look for oriented roundel underneath
var vMask = TAG_TYPE_MASK(constants.TAG_TYPE.H_ORIENTED_ROUNDEL);
drone.config('detect:detections_select_v', vMask);

// look for a shell tag in front
var hMask = TAG_TYPE_MASK(constants.TAG_TYPE.SHELL_TAG_V2);
drone.config('detect:detections_select_h', hMask);

// log navdata
drone.on('navdata', console.log);

var arDrone                = require('..');
var constants              = require('../lib/constants');
var maskingFunctions       = require('../lib/navdata/maskingFunctions');
var TAG_TYPE_MASK          = maskingFunctions.TAG_TYPE_MASK;
var maskFromNavdataOptions = maskingFunctions.maskFromNavdataOptions;

// get a reference to the drone
var client = arDrone.createClient();

// log all errors
client.on('error', function (err) {
  console.log('ERROR:', err);
});

// increase the frequency of the navadata updates
client.config('general:navdata_demo', 'FALSE');

// control the keys in the navdata
var optionsMask = maskFromNavdataOptions(
  constants.options.DEMO,
  constants.options.VISION_DETECT,
  constants.options.EULER_ANGLES
);
client.config('general:navdata_options', optionsMask);

// detect multiple tag types
client.config('detect:detect_type', constants.CAD_TYPE.MULTIPLE_DETECTION_MODE);

// look for oriented roundel underneath
var vMask = TAG_TYPE_MASK(constants.TAG_TYPE.H_ORIENTED_ROUNDEL);
client.config('detect:detections_select_v', vMask);

// look for a shell tag in front
var hMask = TAG_TYPE_MASK(constants.TAG_TYPE.SHELL_TAG_V2);
client.config('detect:detections_select_h', hMask);

// log navdata
client.on('navdata', console.log);

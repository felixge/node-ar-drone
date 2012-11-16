var arDrone                = require('..');
var constants              = require('../lib/constants');
var maskingFunctions       = require('../lib/navdata/maskingFunctions');
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
client.config('detect:detect_type', constants.CAD_TYPE.ORIENTED_ROUNDEL);

// set the drone's "flying mode"
var flyingMode = constants.FLYING_MODE.HOVER_ON_TOP_OF_ORIENTED_ROUNDEL;
client.config('control:flying_mode', flyingMode);

// set the altitude where the drone should hover
var millimeters = 1000;
client.config('control:hovering_range', millimeters);

// log navdata
client.on('navdata', console.log);

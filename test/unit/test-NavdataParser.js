return console.log('disabled!');

var common        = require('../common');
var assert        = require('assert');
var utest         = require('utest');
var NavdataParser = require(common.lib + '/NavdataParser');
var navdataSample = require('../fixtures/navdata-sample');

utest('Navdata', {
  'invalid header': function() {
    // The navdata packets are always supposed to start with:
    // 0x88, 0x77, 0x55, 0x90 (the sequence below is slightly wrong).
    var buffer = new Buffer([0x88, 0x77, 0x55, 0x91]);

    assert.throws(function() {
      (new NavdataParser(buffer)).parse();
    }, /header/i);
  },

  'sequence': function() {
    var navdata = (new NavdataParser(navdataSample)).parse();
    assert.equal(navdata.sequence, 174444);
  },

  'droneState': function() {
    var navdata = (new NavdataParser(navdataSample)).parse();

    assert.equal(navdata.droneState.FLY_MASK, true);
    assert.equal(navdata.droneState.VIDEO_MASK, false);
    assert.equal(navdata.droneState.VISION_MASK, true);
    assert.equal(navdata.droneState.CONTROL_MASK, false);
    assert.equal(navdata.droneState.ALTITUDE_MASK, true);
    assert.equal(navdata.droneState.USER_FEEDBACK_START, true);
    assert.equal(navdata.droneState.COMMAND_MASK, true);
    assert.equal(navdata.droneState.CAMERA_MASK, true);
    assert.equal(navdata.droneState.TRAVELLING_MASK, false);
    assert.equal(navdata.droneState.USB_MASK, false);
    assert.equal(navdata.droneState.NAVDATA_DEMO_MASK, false);
    assert.equal(navdata.droneState.NAVDATA_BOOTSTRAP, false);
    assert.equal(navdata.droneState.MOTORS_MASK, false);
    assert.equal(navdata.droneState.COM_LOST_MASK, false);
    assert.equal(navdata.droneState.SOFTWARE_FAULT, false);
    assert.equal(navdata.droneState.VBAT_LOW, false);
    assert.equal(navdata.droneState.USER_EL, false);
    assert.equal(navdata.droneState.TIMER_ELAPSED, false);
    assert.equal(navdata.droneState.MAGNETO_NEEDS_CALIB, false);
    assert.equal(navdata.droneState.ANGLES_OUT_OF_RANGE, false);
    assert.equal(navdata.droneState.WIND_MASK, false);
    assert.equal(navdata.droneState.ULTRASOUND_MASK, false);
    assert.equal(navdata.droneState.CUTOUT_MASK, false);
    assert.equal(navdata.droneState.PIC_VERSION_MASK, true);
    assert.equal(navdata.droneState.ATCODEC_THREAD_ON, true);
    assert.equal(navdata.droneState.NAVDATA_THREAD_ON, true);
    assert.equal(navdata.droneState.VIDEO_THREAD_ON, true);
    assert.equal(navdata.droneState.ACQ_THREAD_ON, true);
    assert.equal(navdata.droneState.CTRL_WATCHDOG_MASK, false);
    assert.equal(navdata.droneState.ADC_WATCHDOG_MASK, false);
    assert.equal(navdata.droneState.COM_WATCHDOG_MASK, false);
    assert.equal(navdata.droneState.EMERGENCY_MASK, false);
  },

  'visionFlag': function() {
    var navdata = (new NavdataParser(navdataSample)).parse();
    assert.equal(navdata.visionFlag, 1);
  },

  'option: DEMO': function() {
    var navdata = (new NavdataParser(navdataSample)).parse();
    // correct?
    assert.equal(navdata.options.DEMO.ctrlState, 393216);
    // looks reasonable (%)
    assert.equal(navdata.options.DEMO.vbatFlyingPercentage, 48);
    // correct? (milli degree)
    assert.equal(navdata.options.DEMO.theta, -94);
    assert.equal(navdata.options.DEMO.phi, 10);
    assert.equal(navdata.options.DEMO.psi, -82150);
    // correct?
    assert.equal(navdata.options.DEMO.altitude, 0);
    // correct? unit?
    assert.equal(navdata.options.DEMO.velocityX, 0.5757680535316467);
    assert.equal(navdata.options.DEMO.velocityY, 0.38778406381607056);
    assert.equal(navdata.options.DEMO.velocityZ, 0);
  },

  'option: TIME': function() {
    var navdata = (new NavdataParser(navdataSample)).parse();
    // correct?
    assert.equal(navdata.options.TIME, -269095.398);
  },

  'option: RAW_MEASURES': function() {
    var navdata = (new NavdataParser(navdataSample)).parse();
    assert.equal(navdata.options.RAW_MEASURES.raw_accs, 2024);
    assert.equal(navdata.options.RAW_MEASURES.raw_gyros, 2024);
    assert.equal(navdata.options.RAW_MEASURES.raw_gyros_110, 2540);
    assert.equal(navdata.options.RAW_MEASURES.vbat_raw, 2621214);
    assert.equal(navdata.options.RAW_MEASURES.us_debut_echo, 93);
    assert.equal(navdata.options.RAW_MEASURES.us_fin_echo, 0);
    assert.equal(navdata.options.RAW_MEASURES.us_association_echo, 0);
    assert.equal(navdata.options.RAW_MEASURES.us_distance_echo, 11795);
    assert.equal(navdata.options.RAW_MEASURES.us_courbe_temps, 0);
    assert.equal(navdata.options.RAW_MEASURES.us_courbe_valeur, 0);
    assert.equal(navdata.options.RAW_MEASURES.us_courbe_ref, 0);
    assert.equal(navdata.options.RAW_MEASURES.flag_echo_ini, 3758);
    assert.equal(navdata.options.RAW_MEASURES.nb_echo, 0);
    assert.equal(navdata.options.RAW_MEASURES.sum_echo, 4082);
    assert.equal(navdata.options.RAW_MEASURES.alt_temp_raw, 65851);
    assert.equal(navdata.options.RAW_MEASURES.gradient, 0);
  },

  'option: ALTITUDE_MASK': function() {
    var navdata = (new NavdataParser(navdataSample)).parse();
    assert.equal(navdata.options.ALTITUDE.altitude_vision, 0);
    assert.equal(navdata.options.ALTITUDE_MASK.altitude_vz, 0);
    assert.equal(navdata.options.ALTITUDE.altitude_ref, 0);
    assert.equal(navdata.options.ALTITUDE_MASK.altitude_raw, 0);
    assert.equal(navdata.options.ALTITUDE.obs_accZ, 0);
    assert.equal(navdata.options.ALTITUDE_MASK.obs_alt, 0);
  },
});

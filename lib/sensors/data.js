var exports = module.exports = function createData() {
  return new Data();
};

exports.Data = Data;
function Data() {
  this.batteryLevel = undefined;
  this.controlState = undefined;
  this.flyState = undefined;
  this.altitudeMeters = undefined;

  this.orientation = {
    frontBack: undefined,
    leftRight: undefined,
    clockWise: undefined,
  };

  this.speed = {
    frontBack: undefined,
    leftRight: undefined,
    upDown: undefined,
  };

  this.status = {
    flying: undefined,
    videoEnabled: undefined,
    visionEnabled: undefined,
    controlAlgorithm: undefined,
    altitudeControlAlgorithm: undefined,
    startButtonState: undefined,
    controlCommandAck: undefined,
    cameraReady: undefined,
    travellingEnabled: undefined,
    usbReady: undefined,
    navdataDemo: undefined,
    navdataBootstrap: undefined,
    motorProblem: undefined,
    communicationLost: undefined,
    softwareFault: undefined,
    lowBattery: undefined,
    userEmergencyLanding: undefined,
    timerElapsed: undefined,
    magnometerNeedsCalibration: undefined,
    anglesOutOfRange: undefined,
    tooMuchWind: undefined,
    ultrasonicSensorDeaf: undefined,
    cutoutDetected: undefined,
    picVersionNumberOk: undefined,
    atCodecThreadOn: undefined,
    navdataThreadOn: undefined,
    videoThreadOn: undefined,
    acquisitionThreadOn: undefined,
    controlWatchdogDelay: undefined,
    adcWatchdogDelay: undefined,
    comWatchdogProblem: undefined,
    emergencyLanding: undefined,
  };

  this.received = undefined;
}

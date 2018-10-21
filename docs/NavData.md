# NavData API Documentation

The following documents the ```data``` you can expect from the ```navdata``` drone client event

### To activate:
```js
var arDrone = require('ar-drone');
var client = arDrone.createClient();
client.config('general:navdata_demo', 'FALSE');
```

### Register listener for ```data``` event:
```js
client.on('navdata', (data)=>{
    //Handle drone data processing here...
});
```

### ```data``` Object Structure

```json
{
    "header" : "<int>",
    "droneState" : "{<droneStateObj>}",
    "sequenceNumber" : "<int>",
    "visionFlag" : "<int>",
    "demo" : "{<demoObj>}",
    "visionDetect" : "{<visionDetectObj>}"
}
```

### ```droneState``` Object Structure Example [ Drone config values quite self explanatory ]

```json
"droneState": {
    "flying": 0,
    "videoEnabled": 0,
    "visionEnabled": 0,
    "controlAlgorithm": 0,
    "altitudeControlAlgorithm": 1,
    "startButtonState": 0,
    "controlCommandAck": 1,
    "cameraReady": 1,
    "travellingEnabled": 0,
    "usbReady": 0,
    "navdataDemo": 1,
    "navdataBootstrap": 0,
    "motorProblem": 0,
    "communicationLost": 0,
    "softwareFault": 0,
    "lowBattery": 0,
    "userEmergencyLanding": 0,
    "timerElapsed": 1,
    "MagnometerNeedsCalibration": 0,
    "anglesOutOfRange": 1,
    "tooMuchWind": 0,
    "ultrasonicSensorDeaf": 0,
    "cutoutDetected": 0,
    "picVersionNumberOk": 1,
    "atCodecThreadOn": 1,
    "navdataThreadOn": 1,
    "videoThreadOn": 1,
    "acquisitionThreadOn": 1,
    "controlWatchdogDelay": 0,
    "adcWatchdogDelay": 0,
    "comWatchdogProblem": 0,
    "emergencyLanding": 1
}
```

### ```demo``` Object Structure Example [ Sensor values from drone ]

```json
"demo": {
    "controlState": "CTRL_DEFAULT",
    "flyState": "FLYING_OK",
    "batteryPercentage": 87,
    "rotation": {
        "frontBack": -0.665,
        "pitch": -0.665,
        "theta": -0.665,
        "y": -0.665,
        "leftRight": -2.111,
        "roll": -2.111,
        "phi": -2.111,
        "x": -2.111,
        "clockwise": 21.597,
        "yaw": 21.597,
        "psi": 21.597,
        "z": 21.597
    },
    "frontBackDegrees": -0.665,
    "leftRightDegrees": -2.111,
    "clockwiseDegrees": 21.597,
    "altitude": 0,
    "altitudeMeters": 0,
    "velocity": {
        "x": 0,
        "y": 0,
        "z": 0
    },
    "xVelocity": 0,
    "yVelocity": 0,
    "zVelocity": 0,
    "frameIndex": 0,
    "detection": {
        "camera": {
            "rotation": {
                "m11": 0,
                "m12": 0,
                "m13": 0,
                "m21": 0,
                "m22": 0,
                "m23": 0,
                "m31": 0,
                "m32": 0,
                "m33": 0
            },
            "translation": {
                "x": 0,
                "y": 0,
                "z": 0
            },
            "type": 3
        },
        "tagIndex": 0
    },
    "drone": {
        "camera": {
            "rotation": {
                "m11": 0.9297330975532532,
                "m12": -0.36742836236953735,
                "m13": -0.024346796795725822,
                "m21": 0.36805105209350586,
                "m22": 0.9293220639228821,
                "m23": 0.029982319101691246,
                "m31": 0.011609664186835289,
                "m32": -0.0368364192545414,
                "m33": 0.9992538690567017
            },
            "translation": {
                "x": 0,
                "y": 0,
                "z": 0
            }
        }
    }
}
```

@TODO - Further documentation / explanation on ```navdata``` values


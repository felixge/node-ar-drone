# ar-drone

[![Build Status](https://secure.travis-ci.org/felixge/node-ar-drone.png)](http://travis-ci.org/felixge/node-ar-drone)

An implementation of the networking protocols used by the
[Parrot AR Drone 2.0](http://ardrone2.parrot.com/). It appears that 1.0 drones are also [compatible](https://github.com/felixge/node-ar-drone/issues/11#issuecomment-9402270).

Install via Github to get the *latest* version:

```bash
npm install git://github.com/felixge/node-ar-drone.git
```

Or, if you're fine with missing some cutting edge stuff, go for npm:

```bash
npm install ar-drone
```

## Introduction

The AR Drone is an affordable, yet surprisingly capable quadcopter. The drone
itself runs a proprietary firmware that can be controlled via WiFi using the official
FreeFlight mobile app
(available for [iOS](http://itunes.apple.com/us/app/freeflight/id373065271?mt=8) and [Android](https://play.google.com/store/apps/details?id=com.parrot.freeflight&hl=en)).

Unlike the firmware, the client protocol is open, and Parrot publishes an [SDK](https://projects.ardrone.org/projects/show/ardrone-api)
(signup required to download) including a good amount of documentation and C
code. Their target audience seems to be mobile developers who can use this
SDK to create games and other apps for people to have more fun with their drones.

However, the protocol can also be used to receive video and sensor data, enabling
developers to write autonomous programs for the upcoming robot revolution.

## Status

This module is still under [heavy development](CONTRIBUTING.md), so please don't be surprised if
you find some functionality missing or undocumented.

However, the documented parts are tested and should work well for most parts.

## Client

This module exposes a high level Client API that tries to support all drone
features, while making them easy to use.

The best way to get started is to create a `repl.js` file like this:

```js
var arDrone = require('ar-drone');
var client  = arDrone.createClient();
client.createRepl();
```

Using this REPL, you should be able to have some fun:

```js
$ node repl.js
// Make the drone takeoff
drone> takeoff()
true
// Wait for the drone to takeoff
drone> clockwise(0.5)
0.5
// Let the drone spin for a while
drone> land()
true
// Wait for the drone to land
```

Now you could write an autonomous program that does the same:

```js
var arDrone = require('ar-drone');
var client  = arDrone.createClient();

client.takeoff();

client
  .after(5000, function() {
    this.clockwise(0.5);
  })
  .after(3000, function() {
    this.stop();
    this.land();
  });
```

Ok, but what if you want to make your drone to interact with something? Well,
you could start by looking at the sensor data:

```js
client.on('navdata', console.log);
```

Not all of this is handled by the Client library yet, but you should at the
very least be able to receive `droneState` and `demo` data.

A good initial challenge might be to try flying to a certain altitude based
on the `navdata.demo.altitudeMeters` property.

Once you have managed this, you may want to try looking at the camera image. Here
is a simple way to get this as PngBuffers (requires a recent ffmpeg version to
be found in your `$PATH`):

```js
var pngStream = client.getPngStream();
pngStream.on('data', console.log);
```

Your first challenge might be to expose these png images as a node http web
server. Once you have done that, you should try feeding them into the
[opencv](https://npmjs.org/package/opencv) module.

### Client API

#### arDrone.createClient([options])

Returns a new `Client` object. `options` include:

* `ip`: The IP of the drone. Defaults to `'192.168.1.1'`.
* `frameRate`: The frame rate of the PngEncoder. Defaults to `5`.
* `imageSize`: The image size produced by PngEncoder. Defaults to `null`.

#### client.createREPL()

Launches an interactive interface with all client methods available in the
active scope. Additionally `client` resolves to the `client` instance itself.

#### client.getPngStream()

Returns a `PngEncoder` object that emits individual png image buffers as `'data'`
events. Multiple calls to this method returns the same object. Connection lifecycle
(e.g. reconnect on error) is managed by the client.

#### client.getVideoStream()

Returns a `TcpVideoStream` object that emits raw tcp packets as `'data'`
events. Multiple calls to this method returns the same object. Connection lifecycle
(e.g. reconnect on error) is managed by the client.

#### client.takeoff(callback)

Sets the internal `fly` state to `true`, `callback` is invoked after the drone
reports that it is hovering.

#### client.land(callback)

Sets the internal `fly` state to `false`, `callback` is invoked after the drone
reports it has landed.

#### client.up(speed) / client.down(speed)

Makes the drone gain or reduce altitude. `speed` can be a value from `0` to `1`.

#### client.clockwise(speed) / client.counterClockwise(speed)

Causes the drone to spin. `speed` can be a value from `0` to `1`.

#### client.front(speed) / client.back(speed)

Controls the pitch, which a horizontal movement using the camera
as a reference point.  `speed` can be a value from `0` to `1`.

#### client.left(speed) / client.right(speed)

Controls the roll, which is a horizontal movement using the camera
as a reference point.  `speed` can be a value from `0` to `1`.

#### client.stop()

Sets all drone movement commands to `0`, making it effectively hover in place.

#### client.calibrate(device_num)

Asks the drone to calibrate a device.  Currently the AR.Drone firmware
supports only one device that can be calibrated: the magnetometer,
which is device number 0.

The magnetometer can only be calibrated while the drone is flying, and
the calibration routine causes the drone to yaw in place a full 360
degrees.

#### client.config(key, value, callback)

Sends a config command to the drone. You will need to download the drone
[SDK](https://projects.ardrone.org/projects/show/ardrone-api) to find a full list of commands in the `ARDrone_Developer_Guide.pdf`.

For example, this command can be used to instruct the drone to send all navdata.

```js
client.config('general:navdata_demo', 'FALSE');
```

`callback` is invoked after the drone acknowledges the config request
or if a timeout occurs.

Alternatively, you can pass an options object containing the following:

* `key`: The config key to set.
* `value`: The config value to set.
* `timeout`: The time, in milliseconds, to wait for an ACK from the drone.

For example:

```
var callback = function(err) { if (err) console.log(err); };
client.config({ key: 'general:navdata_demo', value: 'FALSE', timeout: 1000 }, callback);
```

#### client.animate(animation, duration)

Performs a pre-programmed flight sequence for a given `duration` (in ms).
`animation` can be one of the following:


```js
['phiM30Deg', 'phi30Deg', 'thetaM30Deg', 'theta30Deg', 'theta20degYaw200deg',
'theta20degYawM200deg', 'turnaround', 'turnaroundGodown', 'yawShake',
'yawDance', 'phiDance', 'thetaDance', 'vzDance', 'wave', 'phiThetaMixed',
'doublePhiThetaMixed', 'flipAhead', 'flipBehind', 'flipLeft', 'flipRight']
```

Example:

```js
client.animate('flipLeft', 1000);
```

Please note that the drone will need a good amount of altitude and headroom
to perform a flip. So be careful!

#### client.animateLeds(animation, hz, duration)

Performs a pre-programmed led sequence at given `hz` frequency and `duration`
(in sec!). `animation` can be one of the following:

```js
['blinkGreenRed', 'blinkGreen', 'blinkRed', 'blinkOrange', 'snakeGreenRed',
'fire', 'standard', 'red', 'green', 'redSnake', 'blank', 'rightMissile',
'leftMissile', 'doubleMissile', 'frontLeftGreenOthersRed',
'frontRightGreenOthersRed', 'rearRightGreenOthersRed',
'rearLeftGreenOthersRed', 'leftGreenRightRed', 'leftRedRightGreen',
'blinkStandard']
```

Example:

```js
client.animateLeds('blinkRed', 5, 2)
```

#### client.disableEmergency()

Causes the emergency REF bit to be set to 1 until
`navdata.droneState.emergencyLanding` is 0. This recovers a drone that has
flipped over and is showing red lights to be flyable again and show green
lights.  It is also done implicitly when creating a new high level client.

#### Events

A client will emit landed, hovering, flying, landing, batteryChange, and altitudeChange events as long as demo navdata is enabled.

To enable demo navdata use

```js
client.config('general:navdata_demo', 'FALSE');
```

## UdpControl

This is a low level API. If you prefer something simpler, check out the Client
docs.

The drone is controlled by sending UDP packets on port 5556. Because UDP
does not guarantee message ordering or delivery, clients must repeatedly send
their instructions and include an incrementing sequence number with each
command.

For example, the command used for takeoff/landing (REF), with a sequence number
of 1, and a parameter of 512 (takeoff) looks like this:

```
AT*REF=1,512\r
```

To ease the creation and sending of these packets, this module exposes an
`UdpControl` class handling this task. For example, the following program will
cause your drone to takeoff and hover in place.

```js
var arDrone = require('ar-drone');
var control = arDrone.createUdpControl();

setInterval(function() {
  // The emergency: true option recovers your drone from emergency mode that can
  // be caused by flipping it upside down or the drone crashing into something.
  // In a real program you probably only want to send emergency: true for one
  // second in the beginning, otherwise your drone may attempt to takeoff again
  // after a crash.
  control.ref({fly: true, emergency: true});
  // This command makes sure your drone hovers in place and does not drift.
  control.pcmd();
  // This causes the actual udp message to be send (multiple commands are
  // combined into one message)
  control.flush();
}, 30);
```

Now that you are airborne, you can fly around by passing an argument to the
`pcmd()` method:

```js
control.pcmd({
  front: 0.5, // fly forward with 50% speed
  up: 0.3, // and also fly up with 30% speed
});
```

That's it! A full list of all `pcmd()` options can be found in the API docs
below.

With what you have learned so far, you could create a simple program
like this:

```js
var arDrone = require('ar-drone');
var control = arDrone.createUdpControl();
var start   = Date.now();

var ref  = {};
var pcmd = {};

console.log('Recovering from emergency mode if there was one ...');
ref.emergency = true;
setTimeout(function() {
  console.log('Takeoff ...');

  ref.emergency = false;
  ref.fly       = true;

}, 1000);

setTimeout(function() {
  console.log('Turning clockwise ...');

  pcmd.clockwise = 0.5;
}, 6000);

setTimeout(function() {
  console.log('Landing ...');

  ref.fly = false;
  pcmd = {};
}, 8000);


setInterval(function() {
  control.ref(ref);
  control.pcmd(pcmd);
  control.flush();
}, 30);
```

### UdpControl API

#### arDrone.createUdpControl([options]) / new arDrone.UdpControl([options])

Creates a new UdpControl instance where `options` can include:

* `ip`: The drone IP address, defaults to `'192.168.1.1'`.
* `port`: The port to use, defaults to `5556`.

#### udpControl.raw(command, [arg1, arg2, ...])

Enqueues a raw `AT*` command. This is useful if you want full control.

For example, a takeoff instructions be send like this:

```js
udpControl.raw('REF', (1 << 9));
```

#### udpControl.ref([options])

Enqueues a `AT*REF` command, options are:

* `fly`: Set this to `true` for takeoff / staying in air, or `false` to initiate
  landing / stay on the ground. Defaults to `false`.
* `emergency`: Set this to `true` to set the emergency bit, or `false` to not
  set it. Details on this can be found in the official SDK Guide. Defaults to
  `false`.

#### udpControl.pcmd([options])

Enqueues a `AT*PCMD` (progressive) command, options are:

* `front` or `back`: Fly towards or away from front camera direction.
* `left` or/ `right`: Fly towards the left or right of the front camera.
* `up` or `down`: Gain or reduce altitude.
* `clockwise` or `counterClockwise`: Rotate around the center axis.

The values for each option are the speed to use for the operation and can range
from 0 to 1. You can also use negative values like `{front: -0.5}`, which is
the same as `{back: 0.5}`.

#### udpControl.flush()

Sends all enqueued commands as an UDP packet to the drone.

## Video

@TODO Document the low level video API.

## Navdata

@TODO Document the low level navdata API.

## Environment variables

* DEFAULT_DRONE_IP

## Camera access

You can access the head camera and the bottom camera, you just have to change
the config:

```javascript
// access the head camera
client.config('video:video_channel', 0);

// access the bottom camera
client.config('video:video_channel', 3);
```



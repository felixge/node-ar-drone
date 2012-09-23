# ar-drone

[![Build Status](https://secure.travis-ci.org/felixge/node-ar-drone.png)](http://travis-ci.org/felixge/node-ar-drone)

An implementation of the networking protocols used by the
[Parrot AR Drone 2.0](http://ardrone2.parrot.com/).

Install via npm:

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

## Control

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
var control = drone.createUdpControl();

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
var control = drone.createUdpControl();
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
* `clockwise` or `counterclockwise`: Rotate around the center axis.

The values for each option are the speed to use for the operation and can range
from 0 to 1. You can also use negative values like `{front: -0.5}`, which is
the same as `{back: 0.5`}.

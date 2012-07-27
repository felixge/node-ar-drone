# node-ar-drone

## Getting started

* Turn on your 2.0 AR Drone (1.0 is not supported)
* Join your drone's wifi network with your computer
* Write your first script, lookaround.js:

```js
var drone = require('ar-drone').createClient();
drone.connect(function(err) {
  if (err) throw err;

  drone.sequence()
    .takeoff(5)
    .up(3, 0.2)
    .turn(5, 0.5)
    .start(function() {
      console.log('That was cool, time to land again!');

      drone.stop();
      drone.land();
    });
});
```

If everything went according to plan, executing `node lookaround.js` should
cause your drone to take off, rise for 3 seconds, turn clockwise for 5 seconds
and then land again.

## API

### drone.takeoff()

Initates takeoff. Has no effect if the drone is already taking off or in the
air.

### drone.land()

Initates landing. Has no effect if the drone is already landing or on the
ground.

### drone.left(speed)
### drone.right(speed)
### drone.front(speed)
### drone.back(speed)
### drone.up(speed)
### drone.down(speed)

Initiates drone movement in the given direction where `speed` is a number from
`0` to `1` (e.g. 0.5). The drone will keep the movement until it is being told
to do something else.

Opposite directions cannot be applied at the same time and will overwrite each
other.

## Todo

* More docs
* Video streaming
* Object tracking
* Improve code quality

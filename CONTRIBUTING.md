# Contributing

## Running the test suite

```js
$ git clone <git url>
$ cd <clone dir>
$ npm install
$ npm test
```

## Running an individual test

```js
$ node test/unit/control/test-AtCommandCreator.js
```

## TODOS

If you are looking for something to work on, here are a few things I'd like to
see in this module:

### arDrone.createCsvRecorder()

This feature would allow users to easily record control, navdata and other
flight related data for later analysis / plotting.

I'm not sure how this should work exactly, but here is one idea:

```js
var recorder = arDrone.createCsvRecorder();
var control = arDrone.createUdpControl({recorder: recorder});
var navdata = arDrone.createUdpNavdataStream({recorder: recorder});

recorder.pipe(fs.createWritableStream(__dirname + '/recording.csv'));
```

The approach could also be inversed:

```js
var control = arDrone.createUdpControl();
var navdata = arDrone.createUdpNavdataStream();
var recorder = arDrone.createCsvRecorder();

recorder.add(navdata);
recorder.add(control);
```

Custom events could be tracked through an EventEmitter-like interface:

```js
recorder.emit('myEvent', 'a string, object, array, buffer, number, etc.');
```

So if you have ideas for this / want to work on it, let me know. My favorite
module for generating the CSV output would be:
[ya-csv](https://github.com/koles/ya-csv).

### Client API

The Client API is still lacking an important feature:

* `client.config()` - allow sending custom config values to a client. This is
  needed to configure things like the 'navdata' and 'camera' settings.

### Parse remaining navdata options

Currently a lot of navdata packages are still not implemented, so have a look
at `lib/navdata/parseNavdata.js` if you'd like to help.

### Streaming to HTML5 video tag

This one is difficult. Right now this library can turn the drone video stream
into a series of PNG buffers which can be rendered using an image tag. However,
this only works well for up to ~5-10 frames per second and is very hacky.

So what would be really cool is playing the video inside an actual video tag.
However, the video data received from the drone is a raw H264 stream. In order
for it to be played inside a browser, it would have to be embedded into a
container format browsers understand (probably quicktime/mp4). FFMPEG does not
seem capable of doing this (the output stream will not be playable until the input
stream has ended). There is a chance that this is because the quicktime/mp4
format does not allow this kind of "streaming", but it could also have other
reasons.

So somebody needs to figure out if ffmpeg is a dead end for this, or if there
is some way to do this.

If ffmpeg turns out to be unviable, another approach would be to implement
a container format (like quicktime/mp4) in JavaScript (I looked into this,
it will be tons of work), or create bindings to something like
[l-smash](http://code.google.com/p/l-smash/) (was recommended to me in #ffmpeg).

Another angle at tackling this problem is not use a video tag, but decode the
h264 stream on a canvas tag instead. This may be very feasable given that there
is already a h264 decoder for JS: [Broadway.js](https://github.com/mbebenita/Broadway)
which could probably be modified for this.

So, if you're looking for a very difficult but interesting problem, let me know
and I'll try to help you on this as much as I can.

### AR Drone 1.0

It [appears](https://github.com/felixge/node-ar-drone/issues/11#issuecomment-9402270) that this library is compatible with 1.0 drones as well,
but feel free to submit bugs / patches if you find any problems.

### Fixing bugs

Bug fixes are always welcome. Please add a test!

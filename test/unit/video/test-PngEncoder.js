var common       = require('../../common');
var assert       = require('assert');
var test         = require('utest');
var sinon        = require('sinon');
var PngEncoder   = require(common.lib + '/video/PngEncoder');
var EventEmitter = require('events').EventEmitter;


test('PngEncoder', {
  before: function() {
    this.fakeFfmpeg = new EventEmitter();

    this.fakeFfmpeg.stdin       = new EventEmitter();
    this.fakeFfmpeg.stdin.write = sinon.stub();
    this.fakeFfmpeg.stdin.end   = sinon.stub();

    this.fakeFfmpeg.stdout = {pipe: sinon.spy()};
    this.fakeFfmpeg.stderr = {pipe: sinon.spy()};

    this.fakeSpawn = sinon.stub();
    this.fakeSpawn.returns(this.fakeFfmpeg);

    this.fakePngSplitter = new EventEmitter();

    this.fakeFrameRate = 23;

    this.fakeBuffer1 = new Buffer('123');
    this.fakeBuffer2 = new Buffer('456');

    this.fakeLog = {};

    this.encoder = new PngEncoder({
      spawn       : this.fakeSpawn,
      frameRate   : this.fakeFrameRate,
      pngSplitter : this.fakePngSplitter,
      log         : this.fakeLog,
    });
  },

  'is a writable stream': function() {
    assert.equal(this.encoder.writable, true);
    assert.equal(typeof this.encoder.write, 'function');
  },

  'is a readable stream': function() {
    assert.equal(this.encoder.readable, true);
    assert.equal(typeof this.encoder.pipe, 'function');
  },

  'first write() spawns ffmpeg': function() {
    this.encoder.write(new Buffer('foo'));

    assert.equal(this.fakeSpawn.callCount, 1);
    assert.equal(this.fakeSpawn.getCall(0).args[0], 'ffmpeg');

    // Another write does not spawn another ffmpeg
    this.encoder.write(new Buffer('bar'));
    assert.equal(this.fakeSpawn.callCount, 1);
  },

  'write() spawn ffmpeg with the right arguments': function() {
    this.encoder.write(new Buffer('foo'));

    var args = this.fakeSpawn.getCall(0).args[1];

    // Read from stdin
    var input = args.indexOf('-i');
    assert.equal(args[input + 1], '-');

    // Use the image2pipe format
    var format = args.indexOf('-f');
    assert.equal(args[format + 1], 'image2pipe');

    // Use the png video codec
    var vcodec = args.indexOf('-vcodec');
    assert.equal(args[vcodec + 1], 'png');

    // Sets the right framerate
    var frameRate = args.indexOf('-r');
    assert.equal(args[frameRate + 1], this.fakeFrameRate);

    // Pipe to stdout
    assert.equal(args[args.length - 1], '-');
  },

  'write() pipes ffmpeg.stdout into PngSplitter': function() {
    this.encoder.write(new Buffer('foo'));

    var stdoutPipe = this.fakeFfmpeg.stdout.pipe;
    assert.equal(stdoutPipe.callCount, 1);
    assert.strictEqual(stdoutPipe.getCall(0).args[0], this.fakePngSplitter);
  },

  'proxies all pngSplitter "data"': function() {
    var dataSpy = sinon.spy();
    this.encoder.on('data', dataSpy);

    this.encoder.write(new Buffer('foo'));
    this.fakePngSplitter.emit('data', this.fakeBuffer1);

    assert.equal(dataSpy.callCount, 1);
    assert.strictEqual(dataSpy.getCall(0).args[0], this.fakeBuffer1);

    this.fakePngSplitter.emit('data', this.fakeBuffer2);
    assert.equal(dataSpy.callCount, 2);
    assert.strictEqual(dataSpy.getCall(1).args[0], this.fakeBuffer2);
  },

  'handles ffmpeg spawn error': function() {
    var errorSpy = sinon.spy();
    this.encoder.on('error', errorSpy);

    this.encoder.write(new Buffer('foo'));

    // simulate ffmpeg not spawning correctly
    var error = new Error('ENOENT');
    error.code = 'ENOENT';
    this.fakeFfmpeg.stdin.emit('error', new Error('EPIPE'));
    this.fakeFfmpeg.emit('error', error);

    assert.equal(errorSpy.callCount, 1);
    assert.equal(/ffmpeg.*not found/i.test(errorSpy.getCall(0).args[0]), true);
  },

  'handles ffmpeg not existing': function() {
    var errorSpy = sinon.spy();
    this.encoder.on('error', errorSpy);

    this.encoder.write(new Buffer('foo'));

    // simulate ffmpeg not existing
    this.fakeFfmpeg.stdin.emit('error', new Error('EPIPE'));
    this.fakeFfmpeg.emit('exit', 127);

    assert.equal(errorSpy.callCount, 1);
    assert.equal(/ffmpeg.*not found/i.test(errorSpy.getCall(0).args[0]), true);
  },

  'handles ffmpeg exit code > 0': function() {
    var errorSpy = sinon.spy();
    this.encoder.on('error', errorSpy);

    this.encoder.write(new Buffer('foo'));

    // simulate an ffmpeg error
    this.fakeFfmpeg.emit('exit', 1);

    assert.equal(errorSpy.callCount, 1);
    assert.equal(/ffmpeg.*error/i.test(errorSpy.getCall(0).args[0]), true);
  },

  'handles expected ffmpeg shutdown': function() {
    var endSpy = sinon.spy();
    this.encoder.on('end', endSpy);

    this.encoder.write(new Buffer('foo'));
    this.encoder.end();
    this.fakeFfmpeg.emit('exit', 0);

    assert.equal(endSpy.callCount, 1);
  },

  'handles unexpected ffmpeg shutdown with exit code 0': function() {
    var errorSpy = sinon.spy();
    this.encoder.on('error', errorSpy);

    this.encoder.write(new Buffer('foo'));
    this.fakeFfmpeg.emit('exit', 0);

    assert.equal(errorSpy.callCount, 1);
    assert.equal(/unexpected.*ffmpeg/i.test(errorSpy.getCall(0).args[0].message), true);
  },

  'write() passes all data into ffmpeg.stdin': function() {
    this.encoder.write(this.fakeBuffer1);

    var stdin = this.fakeFfmpeg.stdin;
    assert.equal(stdin.write.callCount, 1);
    assert.strictEqual(stdin.write.getCall(0).args[0], this.fakeBuffer1);

    this.encoder.write(this.fakeBuffer2);
    assert.equal(stdin.write.callCount, 2);
    assert.strictEqual(stdin.write.getCall(1).args[0], this.fakeBuffer2);
  },

  'write() handles ffmpeg backpressure': function() {
    this.fakeFfmpeg.stdin.write.returns(true);
    var r = this.encoder.write(new Buffer('abc'));
    assert.equal(r, true);

    this.fakeFfmpeg.stdin.write.returns(false);
    r = this.encoder.write(new Buffer('abc'));
    assert.equal(r, false);

    var drainCalled = false;
    this.encoder.on('drain', function () {
        drainCalled = true;
    });
    this.fakeFfmpeg.stdin.emit('drain');
    assert.ok(drainCalled);
  },

  'write() pipes ffmpeg stderr to log': function() {
    this.encoder.write(new Buffer('abc'));

    var stderrPipe = this.fakeFfmpeg.stderr.pipe;
    assert.equal(stderrPipe.callCount, 1);
    assert.strictEqual(stderrPipe.getCall(0).args[0], this.fakeLog);
  },

  'write() does not pipe to log if not set': function() {
    this.encoder = new PngEncoder({spawn: this.fakeSpawn});

    this.encoder.write(new Buffer('abc'));
    assert.equal(this.fakeFfmpeg.stderr.pipe.callCount, 0);
  },

  'end() closes ffmpeg.stdin': function() {
    this.encoder.write(new Buffer('abc'));
    this.encoder.end();

    assert.equal(this.fakeFfmpeg.stdin.end.callCount, 1);
  },

  'end() does not do anything if there is no ffmpeg yet': function() {
    this.encoder.end();
  },
});

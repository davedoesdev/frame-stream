/*global message: false, expect: false */
/*eslint-env node, mocha */

'use strict'

var stream = require('stream')
var frame  = require('../lib')
var assert = require('assert')

suite('unbuffered', function() {
  test('complete frame in one chunk', function(done) {
    var ws = expect({ msg: 'rkusa', framePos: 0, frameLength: 5, frameEnd: true },
                    { msg: 'frame-stream', framePost: 0, frameLength: 12, frameEnd: true },
                    done,
                    { unbuffered: true })

    ws.write(message.slice(0, 9))
    ws.write(message.slice(9, 25))
    ws.end()
  })

  test('single frame in multiple chunks', function(done) {
    var ws = expect({ msg: 'frame-', framePos: 0, frameLength: 12, frameEnd: false },
                    { msg: 'stream', framePos: 6, frameLength: 12, frameEnd: true },
                    done,
                    { unbuffered: true })

    ws.write(message.slice(9, 19))
    ws.write(message.slice(19, 25))
    ws.end()
  })

  test('multiple frames in multiple chunks', function(done) {
    var ws = expect({ msg: 'r', framePos: 0, frameLength: 5, frameEnd: false },
                    { msg: 'ku', framePos: 1, frameLength: 5, frameEnd: false },
                    { msg: 'sa', framePos: 3, frameLength: 5, frameEnd: true },
                    { msg: 'frame-', framePos: 0, frameLength: 12, frameEnd: false },
                    { msg: 'stream', framePos: 6, frameLength: 12, frameEnd: true },
                    done,
                    { unbuffered: true })

    ws.write(message.slice(0, 5))
    ws.write(message.slice(5, 7))
    ws.write(message.slice(7, 19))
    ws.write(message.slice(19, 25))
    ws.end()
  })

  test('multiple frames in one single chunk', function(done) {
    var ws = expect({ msg: 'rkusa', framePos: 0, frameLength: 5, frameEnd: true },
                    { msg: 'frame-stream', framePos: 0, frameLength: 12, frameEnd: true },
                    done,
                    { unbuffered: true })

    ws.write(message)
    ws.end()
  })

  test('one complete frame and another part in one chunk', function(done) {
    var ws = expect({ msg: 'rkusa', framePos: 0, frameLength: 5, frameEnd: true },
                    { msg: 'frame-', framePos: 0, frameLength: 12, frameEnd: false },
                    { msg: 'stream', framePos: 6, frameLength: 12, frameEnd: true },
                    done,
                    { unbuffered: true })

    ws.write(message.slice(0, 19))
    ws.write(message.slice(19, 25))
    ws.end()
  })

  test('length split into parts', function(done) {
    var ws = expect({ msg: 'rkusa', framePos: 0, frameLength: 5, frameEnd: true },
                    { msg: 'frame-stream', framePos: 0, frameLength: 12, frameEnd: true },
                    done,
                    { unbuffered: true })

    ws.write(message.slice(0, 2))
    ws.write(message.slice(2, 11))
    ws.write(message.slice(11, 25))
    ws.end()
  })

  test('length on its own', function(done) {
    var ws = expect({ msg: 'rkusa', framePos: 0, frameLength: 5, frameEnd: true },
                    { msg: 'frame-stream', framePos: 0, frameLength: 12, frameEnd: true },
                    done,
                    { unbuffered: true })

    ws.write(message.slice(0, 4))
    ws.write(message.slice(4, 25))
    ws.end()
  })

  test('zero length frame (e.g., keep-alive)', function(done) {
    var ws = expect(done, { unbuffered: true })

    var msg = Buffer.alloc(4)
    msg.writeInt32BE(0, 0)

    ws.end(msg)
  })

  test('negative length', function(done) {
    var ws = new stream.PassThrough

    ws
    .pipe(frame.decode({ unbuffered: true }))
    .on('error', function(err) {
      assert.equal(err.message, 'Message length is less than zero')
      done()
    })

    var msg = Buffer.alloc(4)
    msg.writeInt32BE(-42, 0)

    ws.end(msg)
  })

  test('max length', function(done) {
    var ws = new stream.PassThrough

    ws
    .pipe(frame.decode({ maxSize: 42, unbuffered: true }))
    .on('error', function(err) {
      assert.equal(err.message, 'Message is larger than the allowed maximum of 42')
      done()
    })

    var msg = Buffer.alloc(4)
    msg.writeInt32BE(43, 0)

    ws.end(msg)
  })
})

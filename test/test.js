/*eslint-env node, mocha */

'use strict'

var stream = require('stream')
var frame = require('../lib')

// Message 1: 5           r  k  u  s  a
//            00 00 00 05 72 6b 75 73 61
// Message 2: 12          f  r  a  m  e  -  s  t  r  e  a  m
//            00 00 00 0c 66 72 61 6d 65 2d 73 74 72 65 61 6d

var message = new Buffer(4 + 5 + 4 + 12)
message.writeInt32BE(5, 0)
message.write('rkusa', 4)
message.writeInt32BE(12, 9)
message.write('frame-stream', 13)

test('complete frame in one chunk', function(done) {
  var ws = expect('rkusa', 'frame-stream', done)

  ws.write(message.slice(0, 9))
  ws.write(message.slice(9, 25))
  ws.end()
})

test('single frame in multiple chunks', function(done) {
  var ws = expect('frame-stream', done)

  ws.write(message.slice(9, 19))
  ws.write(message.slice(19, 25))
  ws.end()
})

test('multiple frames in multiple chunks', function(done) {
  var ws = expect('rkusa', 'frame-stream', done)

  ws.write(message.slice(0, 5))
  ws.write(message.slice(5, 7))
  ws.write(message.slice(7, 19))
  ws.write(message.slice(19, 25))
  ws.end()
})

test('multiple frames in one single chunk', function(done) {
  var ws = expect('rkusa', 'frame-stream', done)

  ws.write(message)
  ws.end()
})

test('one complete frame and another part in one chunk', function(done) {
  var ws = expect('rkusa', 'frame-stream', done)

  ws.write(message.slice(0, 19))
  ws.write(message.slice(19, 25))
  ws.end()
})

test('length split into parts', function(done) {
  var ws = expect('rkusa', 'frame-stream', done)

  ws.write(message.slice(0, 2))
  ws.write(message.slice(2, 11))
  ws.write(message.slice(11, 25))
  ws.end()
})

test('zero length frame (e.g., keep-alive)', function(done) {
  var ws = expect(done)

  var msg = Buffer(4)
  msg.writeInt32BE(0, 0)

  ws.end(msg)
})

test('negative length', function(done) {
  var ws = new stream.PassThrough

  ws
  .pipe(frame())
  .on('error', function(err) {
    assert.equal(err.message, 'Message length is less than zero')
    done()
  })

  var msg = Buffer(4)
  msg.writeInt32BE(-42, 0)

  ws.end(msg)
})

test('max length', function(done) {
  var ws = new stream.PassThrough

  ws
  .pipe(frame({ maxSize: 42 }))
  .on('error', function(err) {
    assert.equal(err.message, 'Message is larger than the allowed maximum of 42')
    done()
  })

  var msg = Buffer(4)
  msg.writeInt32BE(43, 0)

  ws.end(msg)
})

test('framer', function(done) {
  var framer = new frame.FramerStream

  var check = new stream.Transform()
  check._transform = function(buf, enc, cont) {
    assert.equal(buf.readInt32BE(0), 5)
    assert.equal(buf.slice(4, 9).toString(), 'rkusa')
    done()
  }

  framer.pipe(check)
  framer.end('rkusa')
})

var assert = require('assert')

function expect() {
  var expectation = Array.prototype.slice.call(arguments)
  var callback = expectation.pop()

  var transform = new stream.Transform()
  var received = []

  transform._transform = function(buf, enc, cont) {
    received.push(buf)
    cont()
  }

  transform._flush = function(cont) {
    assert.equal(expectation.length, received.length)
    expectation.forEach(function(msg, i) {
      assert.equal(msg, received[i].toString())
    })
    cont()
    callback()
  }

  var ws = new stream.PassThrough
  ws.pipe(frame())
    .pipe(transform)

  return ws
}
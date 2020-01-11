/*eslint-env node, mocha */

'use strict'

var stream = require('stream')
var frame = require('../lib')
var assert = require('assert')

// Message 1: 5           r  k  u  s  a
//            00 00 00 05 72 6b 75 73 61
// Message 2: 12          f  r  a  m  e  -  s  t  r  e  a  m
//            00 00 00 0c 66 72 61 6d 65 2d 73 74 72 65 61 6d

var message = Buffer.alloc(4 + 5 + 4 + 12)
message.writeInt32BE(5, 0)
message.write('rkusa', 4)
message.writeInt32BE(12, 9)
message.write('frame-stream', 13)
global.message = message

global.expect = function() {
  var expectation = Array.prototype.slice.call(arguments)
  var callback = expectation.pop()
  var opts

  if (typeof callback !== 'function') {
    opts = callback
    callback = expectation.pop()
  }

  expectation = expectation.map(function (msg) {
    if (typeof msg === 'string') {
      msg = { msg: msg }
    }
    if (msg.framePos === undefined) {
      msg.framePos = 0
    }
    if (msg.frameLength === undefined) {
      msg.frameLength = msg.msg.length
    }
    if (msg.frameEnd === undefined) {
      msg.frameEnd = true
    }
    return msg
  })

  var transform = new stream.Transform()
  var received = []

  transform._transform = function(buf, enc, cont) {
    received.push(buf)
    cont()
  }

  transform._flush = function(cont) {
    assert.equal(expectation.length, received.length)
    expectation.forEach(function(msg, i) {
      assert.equal(msg.msg, received[i].toString())
      assert.equal(msg.framePos, received[i].framePos)
      assert.equal(msg.frameLength, received[i].frameLength)
      assert.equal(msg.frameEnd, received[i].frameEnd)
    })
    cont()
    callback()
  }

  var ws = new stream.PassThrough
  ws.pipe(frame(opts))
    .pipe(transform)

  return ws
}

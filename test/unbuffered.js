/*global message: false, expect: false */
/*eslint-env node, mocha */

'use strict'

suite('unbuffered', function()
{
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

})

/*eslint-env node, mocha */

'use strict'

var stream = require('stream')
var frame  = require('../lib')
var assert = require('assert')

suite('prefixer', function () {
  test('length-prefixer', function(done) {
    var check = new stream.Transform()
    check._transform = function(buf) {
      assert.equal(buf.readInt32BE(0), 5)
      assert.equal(buf.slice(4, 9).toString(), 'rkusa')
      done()
    }

    var encode = frame.encode()
    encode.pipe(check)
    encode.end('rkusa')
  })
})

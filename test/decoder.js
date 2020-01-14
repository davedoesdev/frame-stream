/*eslint-env node, mocha */

'use strict'

var frame  = require('../lib')

suite('decoder', function () {
  test('zero-length', function(done) {
    frame.decode()._transform(Buffer.alloc(0), 'utf8', done)
  })
})

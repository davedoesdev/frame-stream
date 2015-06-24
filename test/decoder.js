/*eslint-env node, mocha */

'use strict'

var frame  = require('../lib')

suite('decoder', function () {
  test('zero-length', function(done) {
    frame.decode()._transform(new Buffer(0), 'utf8', done)
  })
})

/*eslint-env es6 */
var net = require('net')
var assert = require('assert')
var frame = require('..')
var port = 30000

suite('example', function() {
  test('should work', function (done) {
    net.createServer(function(socket) {
      msgs = []
      socket.pipe(frame.decode()).on('data', function(buf) {
        msgs.push(buf.toString())
      }).on('end', () => {
        assert.equal(msgs.length, 2)
        assert.equal(msgs[0], 'hello world')
        assert.equal(msgs[1], 'cheerio!')
        this.close(done)
      })
    }).listen(port, function() {
      net.connect(port, function() {
        var encode = frame.encode()
        encode.pipe(this)
        encode.write('hello world')
        encode.end('cheerio!')
      })
    })
  })
})

'use strict'

var Transform = require('stream').Transform
var util = require('util')

exports = module.exports = function(opts) {
  return new FrameStream(opts)
}

var FrameStream = exports.FrameStream = function(opts) {
  this.opts = util._extend({
    lengthSize: 4,
    maxSize: 0,
    unbuffered: false
  }, opts)

  this.getLength = this.opts.getLength || createGetLengthMethod(this.opts.lengthSize)
  this.buffer = null
  this.frameLength = 0
  this.framePos = 0

  Transform.call(this, opts)
}

util.inherits(FrameStream, Transform)

FrameStream.prototype._transform = function transform(chunk, enc, cont) {
  while (chunk.length > 0) {
    var start = 0

    if (this.framePos === 0) {
      if (this.buffer) {
        chunk = Buffer.concat([this.buffer, chunk])
        this.buffer = null
      }

      if (chunk.length < this.opts.lengthSize) {
        this.buffer = chunk
        return cont()
      }

      this.frameLength = this.getLength(chunk)

      if (this.frameLength < 0) {
        return cont(new Error('Message length is less than zero'))
      }

      // prevent denial-of-service attacks
      if (this.opts.maxSize > 0 && this.frameLength > this.opts.maxSize) {
        return cont(new Error('Message is larger than the allowed maximum of ' + this.opts.maxSize))
      }

      start = this.opts.lengthSize
    }

    var end = start + this.frameLength - this.framePos

    if (this.opts.unbuffered) {
      end = Math.min(end, chunk.length)
    } else {
      if (chunk.length < end) {
        this.buffer = chunk
        return cont()
      }
    }

    var buf = chunk.slice(start, end)

    buf.framePos = this.framePos
    buf.frameLength = this.frameLength

    this.framePos += end - start
    buf.frameEnd = this.framePos === this.frameLength

    if (buf.frameEnd) {
      this.framePos = 0
    }

    this.push(buf)

    if (chunk.length > end) {
      chunk = chunk.slice(end)
    } else {
      return cont()
    }
  }
}

exports.prefix = function(opts) {
  return new LengthPrefixStream(opts)
}

var LengthPrefixStream = exports.LengthPrefixStream = function(opts) {
  this.opts = util._extend({ lengthSize: 4 }, opts)

  this.setLength = this.opts.setLength || createSetLengthMethod(this.opts.lengthSize)

  Transform.call(this)
}

util.inherits(LengthPrefixStream, Transform)

LengthPrefixStream.prototype._transform = function(message, enc, cont) {
  var length = new Buffer(this.opts.lengthSize)
  this.setLength(length, message.length)
  this.push(Buffer.concat([length, message]))
  cont()
}

function createGetLengthMethod(lengthSize) {
  switch (lengthSize) {
    case 1:
      return function(buffer) {
        return buffer.readInt8(0)
      }
    case 2:
      return function(buffer) {
        return buffer.readInt16BE(0)
      }
    case 4:
      return function(buffer) {
        return buffer.readInt32BE(0)
      }
    default:
      throw new Error('Invalid frame length size')
  }
}

function createSetLengthMethod(lengthSize) {
  switch (lengthSize) {
    case 1:
      return function(buffer, value) {
        return buffer.writeInt8(value, 0)
      }
    case 2:
      return function(buffer, value) {
        return buffer.writeInt16BE(value, 0)
      }
    case 4:
      return function(buffer, value) {
        return buffer.writeInt32BE(value, 0)
      }
    default:
      throw new Error('Invalid frame length size')
  }
}

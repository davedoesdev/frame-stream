'use strict'

var Transform = require('stream').Transform
var util = require('util')

var frame = module.exports = function(opts) {
  return new FrameStream(opts)
}

var FrameStream = frame.FrameStream = function(opts) {
  this.opts = util._extend({ lengthSize: 4, maxSize: 0 }, opts)

  this.getLength = this.opts.getLength || createGetLengthMethod(this.opts.lengthSize)
  this.buffer = null

  Transform.call(this)
}

util.inherits(FrameStream, Transform)

FrameStream.prototype._transform = function transform(chunk, enc, cont) {
  if (this.buffer) {
    chunk = Buffer.concat([this.buffer, chunk])
    this.buffer = null
  }

  if (chunk.length < this.opts.lengthSize) {
    this.buffer = chunk
    return cont()
  }

  var length = this.getLength(chunk)

  if (length < 0) {
    return cont(new Error('Message length is less than zero'))
  }

  // prevent denial-of-service attacks
  if (this.opts.maxSize > 0 && length > this.opts.maxSize) {
    return cont(new Error('Message is larger than the allowed maximum of ' + this.opts.maxSize))
  }

  var end = this.opts.lengthSize + length

  if (chunk.length < end) {
    this.buffer = chunk
    return cont()
  }

  this.push(chunk.slice(this.opts.lengthSize, end))

  if (chunk.length > end) {
    transform.call(this, chunk.slice(end), enc, cont)
  } else {
    cont()
  }
}

var FramerStream = frame.FramerStream = function(opts) {
  this.opts = util._extend({ lengthSize: 4 }, opts)

  this.setLength = this.opts.setLength || createSetLengthMethod(this.opts.lengthSize)

  Transform.call(this)
}

util.inherits(FramerStream, Transform)

FramerStream.prototype._transform = function(message, enc, cont) {
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
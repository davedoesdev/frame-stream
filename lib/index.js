var Transform = require('stream').Transform
var util = require('util')
var assert = require('assert').ok

module.exports = function(opts) {
  return new FrameStream(opts)
}

var FrameStream = module.exports.FrameStream = function(opts) {
  this.opts = util._extend({ lengthSize: 4, maxSize: 0 }, opts)

  this.getLength = this.opts.getLength || createGetLengthMethod(this.opts.lengthSize)
  this.buffer = null

  Transform.call(this, opts)
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
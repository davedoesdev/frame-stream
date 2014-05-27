# frame-stream

Stream of Length-prefix message framing for Node.js streams.

[![NPM][npm]](https://npmjs.org/package/frame-stream)
[![Build Status](travis)](http://travis-ci.org/rkusa/frame-stream)

Some protocols, e.g. TCP, do not not guarantee to keep message boundaries. One common approach to distinguish such messages is *Length Prefixing*, which prepends each message with its length.

## Usage

Simply pipe an incoming (e.g. TCP) stream into `frame-stream`:

```js
var net = require('net')
var frame = require('frame-stream')
var server = net.createServer(function(socket) {
	socket.pipe(frame())
})
server.listen(port)
```

## API

```js
var frame = require('frame-stream')
```

### frame(opts)

This is an alias for `new frame.FrameStream(opts)`. The following options are available:

- **lengthSize** (default: 4) - The length in bytes of the prepended message size.
- **getLength** - The function used to read the prepended message size. This function defaults to `readInt8()`, `readInt16BE()` or `readInt32BE()` according to the `lengthSize`.
- **maxSize** (default: 0)- The maximum allowed message size. This can be used to prevent denial-of-service attacks (`0` = turned off).

### new frame.FramerStream(opts)

This stream prepends each chunk/message with its length. The following options are available:

- **lengthSize** (default: 4) - The length in bytes of the prepended message size.
- **setLength** - The function used to write the prepended message size. This function defaults to `writeInt8()`, `writeInt16BE()` or `writeInt32BE()` according to the `lengthSize`.

**Example:**

```js
var net = require('net')
var frame = require('frame-stream')
var socket = net.connect(port, function() {
  var message = new Buffer('your message')

  var framer = new frame.FramerStream()

  framer.pipe(socket)
        .pipe(frame())
        .pipe(...)

  framer.write(message)
})
```

## MIT License

Copyright (c) 2014 Markus Ast

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[npm]: https://badge.fury.io/js/frame-stream.svg
[travis]: https://secure.travis-ci.org/rkusa/frame-stream.svg

const stream = require('stream');
let Transform = stream.Transform;
let util = require('util');

function HttpStream(options, requestHandler) {
  Transform.call(this, options);
  this.requestBuffer = '';
  this.requestHandler = requestHandler;
}

HttpStream.prototype._transform = function(chunk, encoding, callback) {
  this.requestBuffer += chunk.toString();
  const headersEndFlag = '\r\n\r\n';

  let foundIndex;

  while((foundIndex = this.requestBuffer.indexOf(headersEndFlag)) !== -1) {
    const requestString = this.requestBuffer.slice(0, foundIndex + headersEndFlag.length);
    this.requestBuffer = this.requestBuffer.slice(foundIndex + headersEndFlag.length);
    this.requestHandler(requestString, this);
  }

  callback();
};

util.inherits(HttpStream, Transform);

module.exports = HttpStream;

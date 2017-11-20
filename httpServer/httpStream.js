const stream = require('stream');
let Transform = stream.Transform;
let util = require('util');

function HttpStream(options, requestHandler) {
  Transform.call(this, options);
  this.requestBuffer = '';
  this.requestHandler = requestHandler;
}

HttpStream.prototype._transform = function(ch, enc, cb) {
  this.requestBuffer += ch.toString();
  const headersEndFlag = '\r\n\r\n';

  let foundIndex = this.requestBuffer.indexOf(headersEndFlag);

  while(foundIndex !== -1) {
    const requestString = this.requestBuffer.slice(0, foundIndex + headersEndFlag.length);
    this.requestBuffer = this.requestBuffer.slice(foundIndex + headersEndFlag.length);
    this.requestHandler(requestString, this);
    foundIndex = this.requestBuffer.indexOf(headersEndFlag);
  }

  cb();
};

util.inherits(HttpStream, Transform);

module.exports = HttpStream;

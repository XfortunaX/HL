const pathMod = require('path');
const fs = require('fs-extra');
const CONSTANTS = require('./constants');

function Response(stream, serve) {

  this.stream = stream;
  this.serve = serve;

  this.data = ``;
  this.status = `200 ${CONSTANTS.STATUS_CODES[CONSTANTS.OK]}`;
  this.headers = `Server: ${CONSTANTS.SERVER}\r\nDate: ${new Date().toUTCString()}\r\nConnection: ${CONSTANTS.CONNECTION}\r\n`;
}

Response.prototype._createResponseString = function () {
  return `HTTP/1.1 ${this.status}\r\n${this.headers}\r\n${this.data}`;
};

Response.prototype.setHeader = function (name, value) {
  this.headers += `${name}: ${value}\r\n`;
};

Response.prototype.setStatus = function(statusCode) {
  this.status = `${statusCode} ${CONSTANTS.STATUS_CODES[statusCode]}`;
};

Response.prototype._sendFile = function(fileStat, filePath, ext, method) {
  this.setStatus(CONSTANTS.OK);
  this.setHeader('Content-Type', CONSTANTS.EXTENTIONS[ext] || 'text/plain');
  this.setHeader('Content-Length', fileStat.size);
  this.send();

  if (method === 'GET') {
    const fileStream = fs.createReadStream(filePath, { flags: 'r', mode: 0o666 });

    fileStream.on('data', chunk => {
      this.stream.push(chunk)
    });

  } else {
    this.end();
  }
};

Response.prototype._getFileOr404 = async function({path, method}) {
  const indexFileName = '/index.html';

  const filePath = pathMod.join(this.serve, path.split('?')[0].replace(/\/\.\./g, ''));

  const ext = pathMod.extname(filePath).slice(1);

  try {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      try {
        const indexFilePath = pathMod.join(filePath, indexFileName);
        const indexFileStat = await fs.stat(indexFilePath);
        const ext = pathMod.extname(indexFilePath).slice(1);
        this._sendFile(indexFileStat, indexFilePath, ext, method)
      } catch (err) {
        this.setStatus(CONSTANTS.FORBIDDEN);
        this.send();
        this.end();
      }
    } else {
      this._sendFile(stat, filePath, ext, method);
    }
  } catch (err) {
    this.setStatus(CONSTANTS.NOT_FOUND);
    this.send();
    this.end();
  }
};

Response.prototype.sendFileOr404 = Response.prototype._getFileOr404;
Response.prototype.checkFileOr404 = Response.prototype._getFileOr404;

Response.prototype.end = function() {
  this.stream.push(null)
};

Response.prototype.send = function() {
  const data = this._createResponseString();
  this.stream.push(data);
};

module.exports =  Response;

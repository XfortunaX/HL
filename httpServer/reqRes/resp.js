const pathMod = require('path');
const fse = require('fs-extra');
const CONSTANTS = require('../constants/index');

function Response(stream, serve) {
  this.stream = stream;
  this.serve = serve;

  this.data = ``;
  this.status = `200 ${CONSTANTS.STATUS[CONSTANTS.OK]}`;
  this.headers = `Server: ${CONSTANTS.SERVER}\r\n` +
                 `Date: ${new Date().toUTCString()}\r\n` +
                 `Connection: ${CONSTANTS.CONNECTION}\r\n`;
}

Response.prototype.create = function () {
  return `HTTP/1.1 ${this.status}\r\n${this.headers}\r\n${this.data}`;
};

Response.prototype.setHeader = function (name, value) {
  this.headers += `${name}: ${value}\r\n`;
};

Response.prototype.setStatus = function(status) {
  this.status = `${status} ${CONSTANTS.STATUS[status]}`;
};

Response.prototype.sendFile = function(fileStat, filePath, ext, method) {
  this.setStatus(CONSTANTS.OK);
  this.setHeader('Content-Type', CONSTANTS.EXTENTIONS[ext] || 'text/plain');
  this.setHeader('Content-Length', fileStat.size);
  this.send();

  if (method === 'GET') {
    const fileStream = fse.createReadStream(filePath, { flags: 'r', mode: 0o666 });
    fileStream.on('data', chunk => {
      this.stream.push(chunk);
      if (chunk.length < 65500) {
        this.stream.push(null);
      }
    });
  } else {
    this.end();
  }
};

Response.prototype.check = async function({path, method}) {
  const indexFileName = '/index.html';
  const filePath = pathMod.join(this.serve, path.split('?')[0].replace(/\/\.\./g, ''));
  const ext = pathMod.extname(filePath).slice(1);

  try {
    const stat = await fse.stat(filePath);
    if (stat.isDirectory()) {
      try {
        const indexFilePath = pathMod.join(filePath, indexFileName);
        const indexFileStat = await fse.stat(indexFilePath);
        const ext = pathMod.extname(indexFilePath).slice(1);
        this.sendFile(indexFileStat, indexFilePath, ext, method);
      } catch (err) {
        this.setStatus(CONSTANTS.FORBIDDEN);
        this.send();
        this.end();
      }
    } else {
      this.sendFile(stat, filePath, ext, method);
    }
  } catch (err) {
    this.setStatus(CONSTANTS.NOT_FOUND);
    this.send();
    this.end();
  }
};

Response.prototype.end = function() {
  this.stream.push(null)
};

Response.prototype.send = function() {
  const data = this.create();
  this.stream.push(data);
};

module.exports =  Response;

const net = require('net');
const Request = require('./request');
const Response = require('./response');
const HttpStream = require('./httpStream');
const CONSTANTS = require('./constants');
let util = require('util');
let netServer = net.Server;

function HttpServer(port, serve) {
  this.port = port;

  this.serve = serve;

  this.registeredRoutes = {
    getRoutes: {},
    headRoutes: {}
  };

  this._handleHttpRequest = this._handleHttpRequest.bind(this);

  netServer.call(this, null);
  this.on('connection', this._connectionListener);
  this.listen(this.port);
}

HttpServer.prototype._connectionListener = function(socket) {
  socket.setKeepAlive(true, 10);

  const httpStream = new HttpStream(null, this._handleHttpRequest);

  socket
    .pipe(httpStream)
    .pipe(socket)
};

HttpServer.prototype._get = function(path, handler) {
  this.registeredRoutes.getRoutes[path] = handler;
};

HttpServer.prototype._head = function(path, handler) {
  this.registeredRoutes.headRoutes[path] = handler;
};

HttpServer.prototype._handleHttpRequest = function(requestString, stream) {
  const request = new Request(requestString);

  switch (request.method) {
    case 'GET': {
      const response = new Response(stream, this.serve);
      if (!this.registeredRoutes.getRoutes[request.path]) {
        if (this.registeredRoutes.getRoutes['*']) {
          this.registeredRoutes.getRoutes['*'](request, response);
        } else {
          this.resp(response, CONSTANTS.NOT_FOUND);
        }
      } else {
        this.registeredRoutes.getRoutes[request.path](request, response);
      }
      break;
    }
    case 'HEAD': {
      const response = new Response(stream, this.serve);
      if (!this.registeredRoutes.headRoutes[request.path]) {
        if (this.registeredRoutes.headRoutes['*']) {
          this.registeredRoutes.headRoutes['*'](request, response);
        } else {
          this.resp(response, CONSTANTS.NOT_FOUND);
        }
      } else {
        this.registeredRoutes.headRoutes[request.path](request, response);
      }
      break;
    }
    default: {
      const response = new Response(stream, this.serve);
      this.resp(response, CONSTANTS.NOT_ALLOWED);
    }
  }
};

HttpServer.prototype.resp = function(response, status) {
  response.setStatus(status);
  response.send();
  response.end();
};

util.inherits(HttpServer, netServer);

module.exports = HttpServer;

const net = require('net');
const Request = require('./reqRes/req');
const Response = require('./reqRes/resp');
const HttpStream = require('./httpStream');
const CONSTANTS = require('./constants/index');
let util = require('util');
let netServer = net.Server;

function HttpServer(port, serve) {
  this.port = port;
  this.serve = serve;
  this.routes = {
    getRoutes: {},
    headRoutes: {}
  };

  this.handleRequest = this.handleRequest.bind(this);

  netServer.call(this, null);
  this.on('connection', this.conListener);
  this.listen(this.port);
}

HttpServer.prototype.conListener = function(socket) {
  socket.setKeepAlive(true, 10);
  const httpStream = new HttpStream(null, this.handleRequest);
  socket
    .pipe(httpStream)
    .pipe(socket)
};

HttpServer.prototype.get = function(path, handler) {
  this.routes.getRoutes[path] = handler;
};

HttpServer.prototype.head = function(path, handler) {
  this.routes.headRoutes[path] = handler;
};

HttpServer.prototype.handleRequest = function(reqStr, stream) {
  const request = new Request(reqStr);
  const response = new Response(stream, this.serve);

  if (request.method === 'GET') {
    if (!this.routes.getRoutes[request.path]) {
      if (this.routes.getRoutes['*']) {
        this.routes.getRoutes['*'](request, response);
      } else {
        this.resp(response, CONSTANTS.NOT_FOUND);
      }
    } else {
      this.routes.getRoutes[request.path](request, response);
    }
  } else if (request.method === 'HEAD') {
    if (!this.routes.headRoutes[request.path]) {
      if (this.routes.headRoutes['*']) {
        this.routes.headRoutes['*'](request, response);
      } else {
        this.resp(response, CONSTANTS.NOT_FOUND);
      }
    } else {
      this.routes.headRoutes[request.path](request, response);
    }
  } else {
    this.resp(response, CONSTANTS.NOT_ALLOWED);
  }

};

HttpServer.prototype.resp = function(response, status) {
  response.setStatus(status);
  response.send();
  response.end();
};

util.inherits(HttpServer, netServer);

module.exports = HttpServer;

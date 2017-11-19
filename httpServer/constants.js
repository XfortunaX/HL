module.exports = {
  STATUS_CODES: {
    200: 'OK',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed'
  },
  CONNECTION: 'keep-alive',
  EXTENTIONS: {
    html: "text/html",
    css: "text/css",
    png: "image/png",
    gif: "image/gif",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    js: "application/javascript",
    swf: "application/x-shockwave-flash"
  },
  SERVER: `Node.js ${process.version} (${process.platform})`,
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  OK: 200,
  NOT_ALLOWED: 405
};

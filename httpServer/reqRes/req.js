function Request(str) {
  let method = str.substr(0, str.indexOf(" "));
  let start = str.indexOf(method) + method.length + 1;
  let length = str.lastIndexOf("HTTP") - start - 1;
  let path = decodeURIComponent(str.substr(start, length));

  this.path = path;
  this.method = method;
}

module.exports = Request;

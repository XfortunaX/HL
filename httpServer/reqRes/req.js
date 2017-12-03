function Request(str) {
  let path_method = str.split(' ', 2);

  this.path = decodeURIComponent(path_method[1]);
  this.method = path_method[0];
}

module.exports = Request;

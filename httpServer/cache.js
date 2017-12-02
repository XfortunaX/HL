function cachee() {
  if (cachee.instance) {
    return cachee.instance;
  }
  this.data = {};
  cachee.instance = this;
}

cachee.prototype.add = function (path, value) {
  this.data[path] = value;
};

cachee.prototype.check = function (path) {
  if (path in this.data) {
    return true;
  }
  return false;
};

cachee.prototype.get = function (path) {
  return this.data[path];
};

module.exports = cachee;
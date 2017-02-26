const path = require('path');

const Manifest = function(fs, date, manifestPath, validity) {
  this.fs = fs;
  this.date = date;
  this.manifestPath = manifestPath;
  this.validity = validity;
  this.manifest = this.open(manifestPath);
}

Manifest.prototype.open = function() {
  if (this.fs.existsSync(this.manifestPath)) {
    return JSON.parse(this.fs.readFileSync(this.manifestPath));
  }

  this.write({});
  return {};
}

Manifest.prototype.write = function(manifest) {
  const dirname = path.dirname(this.manifestPath)

  if (!this.fs.existsSync(dirname)) {
    this.fs.mkdirSync(dirname);
  }

  const manifestToWrite = JSON.stringify(manifest);
  this.fs.writeFile(this.manifestPath, manifestToWrite)
    .catch(error => console.error(error));
}

/**
 * Add an entry to the manifest.
 *
 * @param {String} path
 * @param {Number} expirationDate
 */
Manifest.prototype.add = function(path) {
  this.manifest[path] = this.calculateValidity();

  this.write(this.manifest);
}

/**
 * Returns if the path exists in the manifest.
 *
 * @param  {String} path
 * @return {Boolean}
 */
Manifest.prototype.exists = function(path) {
  return (path in this.manifest);
}

/**
 * Returns if the snapshot is still valid.
 * If the path does not exist in the manifest, it returns false.
 *
 * @param  {String} path
 * @return {Boolean}
 */
Manifest.prototype.isValid = function(path) {
  if (!this.exists(path)) {
    return false;
  }

  const expirationDate = this.manifest[path];

  return this.date.now() < expirationDate;
}

Manifest.prototype.calculateValidity = function(validity) {
  return this.date.now() + (this.validity * 60 * 1000);
}

module.exports = Manifest;

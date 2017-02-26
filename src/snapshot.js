const path = require('path');

const Snapshot = function(manifest, fs, browser, snapshotDirectory, applicationPath, validity) {
  this.fs = fs;
  this.browser = browser;
  this.validity = validity;
  this.manifest = manifest;
  this.applicationPath = applicationPath;
  this.snapshotDirectory = snapshotDirectory;
}

Snapshot.prototype.getPath = function(pathname) {
  const filename = path.basename(pathname) === ''
    ? `${pathname}index.snapshot`
    : `${pathname}.snapshot`;

  return path.join(this.snapshotDirectory, filename);
}

Snapshot.prototype.exists = function(pathname) {
  const snapshotPath = this.getPath(pathname);
  return this.manifest.exists(snapshotPath);
}

Snapshot.prototype.isValid = function(pathname) {
  if (this.validity === 0) {
    return true;
  }

  const snapshotPath = this.getPath(pathname);
  return this.manifest.isValid(snapshotPath);
}

Snapshot.prototype.getApplication = function() {
  try {
    return this.fs.readFileSync(this.applicationPath);
  } catch (error) {
    console.error(error);
    throw new Error(`
      Could not find a build index.html, please run 'yarn build'
      before running create-snapshot-server.
    `);
  }
}

Snapshot.prototype.create = async function(pathname) {
  const html = this.getApplication();
  const browser = new this.browser(pathname, html);
  return await browser.execute();
}

Snapshot.prototype.getPath = function(pathname) {
  const filename = path.basename(pathname) === ''
  ? `${pathname}index.snapshot`
  : `${pathname}.snapshot`;

  return path.join(this.snapshotDirectory, filename);
}

Snapshot.prototype.save = function(pathname, contents) {
  const snapshotPath = this.getPath(pathname);

  const dirname = path.dirname(snapshotPath)

  if (!this.fs.existsSync(dirname)) {
    this.fs.mkdirSync(dirname);
  }

  this.manifest.add(snapshotPath);

  return this.fs
    .writeFile(snapshotPath, contents)
    .catch(error => console.error(error));
}

module.exports = Snapshot;

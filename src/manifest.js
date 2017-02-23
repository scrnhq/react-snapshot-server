const __dir = process.cwd();
const path = require('path');
const fs = require('fs-promise');
const makePath = require('mkpath');
const jsonfile = require('jsonfile');

const MANIFEST_DIR = path.join(__dir, 'build', 'snapshots');
const MANIFEST_PATH = path.join(MANIFEST_DIR, 'manifest.json')

makePath.sync(MANIFEST_DIR);

const manifest = boot();

/**
 * Boot the manifest, create if necessary, and return the contents.
 *
 * @return {Object}
 */
function boot() {
  if (fs.existsSync(MANIFEST_PATH)) {
    return jsonfile.readFileSync(MANIFEST_PATH);
  }

  jsonfile.writeFile(MANIFEST_PATH, {}, function (err) {
    if (err) { console.error(err) }
  });

  return {};
}

/**
 * Add a snapshot to the manifest.
 *
 * @param {String} path
 * @param {Number} expirationDate
 */
function add(path, expirationDate) {
  manifest[path] = expirationDate;

  jsonfile.writeFile(MANIFEST_PATH, manifest, function (err) {
    if (err) { console.error(err) }
  });
}

/**
 * Returns if the path exists in the manifest.
 *
 * @param  {String} path
 * @return {Boolean}
 */
function exists(path) {
  return (path in manifest);
}

/**
 * Returns if the snapshot is still valid.
 * If the path does not exist in the manifest, it returns false.
 *
 * @param  {String} path
 * @return {Boolean}
 */
function valid(path) {
  if (!exists(path)) {
    return false;
  }

  const expirationDate = manifest[path];

  return Date.now() < expirationDate;
}

module.exports = {
  add,
  valid,
  exists,
}

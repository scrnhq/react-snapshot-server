const path = require('path');
const stream = require('send');
const jsdom = require('jsdom');
const { parse } = require('url');
const fs = require('fs-promise');
const { send } = require('micro');
const mime = require('mime-types');

const Manifest = require('./manifest');
const Snapshot = require('./snapshot');
const BrowserFactory = require('./browser');
const browser = new BrowserFactory(jsdom);

const handleErrors = fn => async (req, res, ...other) => {
  try {
    return await fn(req, res, ...other);
  } catch (err) {
    console.error(err.stack);
    send(res, 500, 'Internal server error');
  }
}

const Server = function(flags) {
  const BUILD_DIRECTORY = flags.path;
  const SNAPSHOT_DIRECTORY = path.join(BUILD_DIRECTORY, 'snapshots');
  const MANIFEST_PATH = path.join(SNAPSHOT_DIRECTORY, 'manifest.json');
  const APPLICATION_PATH = path.join(BUILD_DIRECTORY, 'index.html');

  const manifest = new Manifest(fs, Date, MANIFEST_PATH, flags.validity);
  const snapshot = new Snapshot(manifest, fs, browser, SNAPSHOT_DIRECTORY, APPLICATION_PATH);

  return handleErrors(async (req, res) => {
    const url = req.headers.host + req.url;
    const { pathname } = parse(req.url);
    const filepath = path.join(BUILD_DIRECTORY, pathname);
    const extname = path.extname(pathname);

    if (extname !== '') {
      if (fs.existsSync(filepath)) {
        res.setHeader('Content-Type', mime.contentType(extname));
        return stream(req, filepath).pipe(res);
      } else {
        return send(res, 404);
      }
    }

    if (!snapshot.exists(pathname)) {
      const snap = await snapshot.create(url);
      await snapshot.save(pathname, snap);
      console.log(`📝  Created a fresh new snapshot for ${pathname}`);
      return snap;
    }

    if (!snapshot.isValid(pathname)) {
      const snap = await snapshot.create(url);
      await snapshot.save(pathname, snap);
      console.log(`⏰  Snapshot expired, creating a fresh new snapshot for ${pathname}`);
      return snap;
    }

    console.log(`🔍  Found snapshot for ${pathname}`);
    res.setHeader('Content-Type', 'text/html');
    return stream(req, snapshot.getPath(pathname)).pipe(res);
  });
}

module.exports = Server;

const path = require('path');
const { parse } = require('url');

const __dir = process.cwd();

const stream = require('send');
const fs = require('fs-promise');
const mime = require('mime-types');
const snapshot = require('./snapshot');

module.exports = async (req, res) => {
  const url = req.headers.host + req.url;
  const { pathname } = parse(req.url);
  const filepath = path.join(__dir, 'build', pathname);
  const dirname = path.dirname(pathname);
  const extname = path.extname(pathname);

  if (extname !== '' && (dirname === '/' || dirname.startsWith('/static'))) {
    if (fs.existsSync(filepath)) {
      res.setHeader('Content-Type', mime.contentType(extname));
      return stream(req, filepath).pipe(res);
    }
  }

  if (!snapshot.exists(pathname)) {
    const snap = await snapshot.create(url);
    await snapshot.save(pathname, snap);
    console.log(`📝  Created a fresh new snapshot for ${pathname}`);
    return snap;
  }

  if (!snapshot.valid(pathname)) {
    const snap = await snapshot.create(url);
    await snapshot.save(pathname, snap);
    console.log(`⏰  Snapshot expired, creating a fresh new snapshot for ${pathname}`);
    return snap;
  }

  console.log(`🔍  Found snapshot for ${pathname}`);
  return snapshot.send(req, res, pathname);
};

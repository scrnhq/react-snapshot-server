const __dir = process.cwd();
const path = require('path');
const stream = require('send');
const React = require('react');
const jsdom = require('jsdom');
const fs = require('fs-promise');
const makePath = require('mkpath');
const { renderToString } = require('react-dom/server');

const flags = require('./flags');
const manifest = require('./manifest');

const SNAPSHOT_DURATION = calculateDuration(flags.snapshotDuration);
const ENTRY_POINT = path.join(__dir, 'build', 'index.html');
const SNAPSHOT_DIR = path.join(__dir, 'build', 'snapshots');

makePath(SNAPSHOT_DIR);

/**
 * Calculate duration from minutes to microseconds.
 *
 * @param  {Number} duration
 * @return {Number}
 */
function calculateDuration(duration) {
  return 1000 * 60 * Number(duration);
}

/**
 * Returns if the pathname has a snapshot.
 *
 * @param  {String} url
 * @return {Boolean}
 */
function exists(pathname) {
  const snapshotPath = getPath(pathname);
  return manifest.exists(snapshotPath);
}

/**
 * Returns if the pathname has a valid snapshot.
 *
 * If the SNAPSHOT_DURATION is set to 0, always return true.
 *
 * @param  {String} url
 * @return {Boolean}
 */
function valid(pathname) {
  if (SNAPSHOT_DURATION === 0) {
    return true;
  }

  const snapshotPath = getPath(pathname);
  return manifest.valid(snapshotPath);
}

/**
 * Get the path of a snapshot based on the request pathname.
 *
 * @param  {String} pathname
 * @return {String}
 */
function getPath(pathname) {
  const filename = path.basename(pathname) === ''
    ? `${pathname}index.snapshot`
    : `${pathname}.snapshot`;

  return path.join(SNAPSHOT_DIR, filename);
}

/**
 * Pipe the conents of a snapshot to the response.
 *
 * @param  {Request} req
 * @param  {Response} res
 * @param  {String} pathname
 * @return {Stream}
 */
function send(req, res, pathname) {
  const snapshotPath = getPath(pathname);
  res.setHeader('Content-Type', 'text/html');
  return stream(req, snapshotPath).pipe(res);
}

/**
 * Create a new snapshot for a pathname.
 *
 * @param  {String}  pathname
 * @return {Promise}
 */
async function create(pathname) {
  const html = await fs.readFile(ENTRY_POINT);

  return new Promise(resolve => {
    jsdom.env({
      html,
      features: {
        FetchExternalResources: ['script'],
        ProcessExternalResources: ['script'],
        SkipExternalResources: false,
      },
      async resourceLoader(resource, callback) {
        const resourcePathname = resource.url.pathname;
        const content = await fs.readFile(`./build/${resourcePathname}`, 'utf-8');
        callback(null, content);
      },
      virtualConsole: jsdom.createVirtualConsole().sendTo(console),
      created: (err, window) => {
        jsdom.changeURL(window, 'http://' + pathname);
      },
      done: async (err, window) => {
        const app = window.app;

        let initialProps;

        if (typeof app.getInitialProps === 'function') {
          initialProps = await app.getInitialProps();
        } else {
          initialProps = {};
        }

        const content = renderToString(
          React.createElement(app, initialProps)
        );

        window.document.getElementById('root').innerHTML = content;

        if (initialProps) {
          const script = window.document.createElement('script');
          const stringifiedProps = JSON.stringify(initialProps);
          script.text = `window.__INITIAL_PROPS__ = ${stringifiedProps}`;
          const firstScript = window.document.body.getElementsByTagName('script')[0];
          window.document.body.insertBefore(script, firstScript);
        }

        resolve(window.document.documentElement.outerHTML);
      },
    });
  });
}

/**
 * Save a snapshot.
 *
 * @param  {String}  pathname
 * @param  {String}  contents
 * @return {Promise}
 */
async function save(pathname, contents) {
  const snapshotPath = getPath(pathname);
  const expirationDate = Date.now() + SNAPSHOT_DURATION;
  manifest.add(snapshotPath, expirationDate);
  makePath.sync(path.dirname(snapshotPath));

  return fs.writeFile(snapshotPath, contents);
}

module.exports = {
  save,
  send,
  valid,
  create,
  exists,
  getPath,
};

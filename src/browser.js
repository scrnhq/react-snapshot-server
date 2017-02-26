const React = require('react');
const { renderToString } = require('react-dom/server');

const browserConfig = {
  features: {
    FetchExternalResources: ['script'],
    ProcessExternalResources: ['script'],
    SkipExternalResources: false,
  },
};

const Browser = function(jsdom, pathname, html) {
  this.jsdom = jsdom;
  this.html = html;
  this.pathname = pathname;
}

Browser.prototype.created = function(resolve, reject, error, window) {
  if (error) { console.error(error) }
  this.jsdom.changeURL(window, 'http://' + this.pathname);
}

Browser.prototype.done = async function(resolve, reject, error, window) {
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

  resolve(window.document.documentElement.outerHTML);
}

Browser.prototype.execute = function() {
  return new Promise((resolve, reject) => {
    this.jsdom.env({
      html: this.html,
      ...browserConfig,
      virtualConsole: this.jsdom.createVirtualConsole().sendTo(console),
      created: this.created.bind(this, resolve, reject),
      done: this.done.bind(this, resolve, reject),
    });
  });
}

const BrowserFactory = function(jsdom) {
  return Browser.bind(null, jsdom);
};

module.exports = BrowserFactory;

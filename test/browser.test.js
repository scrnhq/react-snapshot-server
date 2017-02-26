const React = require('react');
const BrowserFactory = require('../src/browser');

const getInitialPropsMock = jest.fn();

const mockApp = React.createClass({
  statics: {
    getInitialProps: getInitialPropsMock,
  },
  render: function() {
    return React.createElement('div', null, 'Hello world');
  }
});

const windowMock = {
  app: mockApp,
  document: {
    getElementById: () => ({}),
    documentElement: {
      outerHTML: '<HTML>Executed</HTML>',
    }
  }
};

describe('browser', () => {
  let jsdomMock;
  let browserInstance;

  beforeEach(() => {
    jsdomMock = {
      env: jest.fn(config => {
        config.created(null, windowMock);
        config.done(null, windowMock);
      }),
      changeURL: jest.fn(),
      createVirtualConsole: jest.fn(() => ({ sendTo: () => {} })),
    }

    const Browser = new BrowserFactory(jsdomMock);
    browserInstance = new Browser('site.com/foo', '<HTML>');
  });

  it('will execute HTML in virtual browser', async () => {
    const result = await browserInstance.execute();
    expect(jsdomMock.env).toHaveBeenCalled();
    expect(result).toBe('<HTML>Executed</HTML>');
  });

  it('will update the url with the pathname', async () => {
    await browserInstance.execute();
    expect(jsdomMock.changeURL).toHaveBeenCalledWith(windowMock, 'http://site.com/foo');
  });

  it('will call getInitialProps on app if it is defined', async () => {
    await browserInstance.execute();
    expect(getInitialPropsMock).toHaveBeenCalled();
  });
});

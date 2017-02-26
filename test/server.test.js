const temp = require('tmp');
const path = require('path');
const fs = require('fs-extra');
const micro = require('micro');
const listen = require('test-listen');
const request = require('request-promise');
const Server = require('../src/server');

const MOCK_BUILD_DIRECTORY = path.join(__dirname, 'build');

describe('server', () => {
  let fakeDir;

  beforeEach(() => {
    fakeDir = temp.dirSync().name;
    fs.copySync(MOCK_BUILD_DIRECTORY, fakeDir);
  });

  it('returns 200', async () => {
    const flags = { validity: 0, path: fakeDir };
    const server = new Server(flags);
    const service = micro(server);

    const url = await listen(service);
    const response = await request({ uri: url, resolveWithFullResponse: true });

    expect(response.statusCode).toBe(200);
  });

  it('returns 200 for nested URLs', async () => {
    const flags = { validity: 0, path: fakeDir };
    const server = new Server(flags);
    const service = micro(server);

    const url = await listen(service);
    const response = await request({
      uri: `${url}/foo/bar`,
      resolveWithFullResponse: true
    });

    expect(response.statusCode).toBe(200);
  });

  it('contains the JS file', async () => {
    const flags = { validity: 0, path: fakeDir };
    const server = new Server(flags);
    const service = micro(server);

    const url = await listen(service);
    const response = await request(url);

    expect(response).toContain('/static/js/main');
  });

  it('renders the application on the server', async () => {
    const flags = { validity: 0, path: fakeDir };
    const server = new Server(flags);
    const service = micro(server);

    const url = await listen(service);
    const response = await request(url);

    expect(response).toContain('Welcome to React');
  });

  it('renders the application with react server side magic', async () => {
    const flags = { validity: 0, path: fakeDir };
    const server = new Server(flags);
    const service = micro(server);

    const url = await listen(service);
    const response = await request(url);

    expect(response).toContain('data-reactroot');
  });

  it('should serve files directly', async () => {
    const flags = { validity: 0, path: fakeDir };
    const server = new Server(flags);
    const service = micro(server);

    const url = await listen(service);
    const response = await request({ uri: `${url}/favicon.ico`, resolveWithFullResponse: true });

    expect(response.headers['content-type']).toBe('image/x-icon');
  });

  it('returns 404 when file does not exist', async () => {
    const flags = { validity: 0, path: fakeDir };
    const server = new Server(flags);
    const service = micro(server);

    const url = await listen(service);
    const response = await request({
      simple: false,
      uri: `${url}/does-not-exist.jpg`,
      resolveWithFullResponse: true,
    });

    expect(response.statusCode).toBe(404);
  });
})

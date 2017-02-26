const Snapshot = require('../src/snapshot');

describe('snapshot', () => {
  let fsMock;
  let validity;
  let snapshot;
  let browserMock;
  let manifestMock;

  beforeEach(() => {
    validity = 10;

    manifestMock = {
      add: jest.fn(),
      exists: jest.fn(() => true),
      isValid: jest.fn(() => true),
    };

    fsMock = {
      existsSync: jest.fn(() => true),
      writeFile: jest.fn(() => new Promise(resolve => resolve())),
      readFileSync: jest.fn(() => ''),
    };

    browserMock = function() {
      return {
        execute: jest.fn(() => new Promise(resolve => resolve('<HTML>'))),
      };
    };

    snapshot = new Snapshot(manifestMock, fsMock, browserMock, 'snapdir', 'build/index.html', validity);
  });

  it('calls the manifest to check if snapshot exists', () => {
    const exists = snapshot.exists('foo');
    expect(manifestMock.exists).toHaveBeenCalledWith('snapdir/foo.snapshot');
    expect(exists).toBe(true);
  });

  it('calls the manifest to check if the snapshot is still valid', () => {
    const valid = snapshot.isValid('foo');
    expect(manifestMock.isValid).toHaveBeenCalledWith('snapdir/foo.snapshot');
    expect(valid).toBe(true);
  });

  it('creates a new snapshot', async () => {
    const result = await snapshot.create('foo');
    expect(result).toContain('<HTML>');
  });

  it('saves a new snapshot', () => {
    snapshot.save('foo', '<HTML>');
    expect(fsMock.writeFile).toHaveBeenCalledWith('snapdir/foo.snapshot', '<HTML>');
  });
});

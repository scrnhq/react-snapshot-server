const Manifest = require('../src/manifest');

describe('manifest', () => {
  let now;
  let path;
  let fsMock;
  let dateMock;
  let validity;
  let manifest;

  beforeEach(() => {
    now = 1488016635920;
    path = 'manifestPath';
    validity = 10;

    fsMock = {
      existsSync: jest.fn(() => true),
      readFileSync: jest.fn(() => (JSON.stringify({}))),
      writeFile: jest.fn(() => new Promise((resolve, reject) => {})),
    };

    dateMock = { now: jest.fn(() => now)}

    manifest = new Manifest(fsMock, dateMock, path, validity);
  });

  it('will read from the manifest file', () => {
    expect(fsMock.readFileSync).toHaveBeenCalledWith(path);
  });

  it('can add a new entry to the manifest', () => {
    manifest.add('foo');
    const expirationDate = now + (validity * 60 * 1000);
    const data = JSON.stringify({ foo: expirationDate });
    expect(fsMock.writeFile).toHaveBeenCalledWith(path, data);
  });

  it('can add a second entry to the manifest', () => {
    manifest.add('foo');
    manifest.add('bar');
    const expirationDate = now + (validity * 60 * 1000);
    const data = JSON.stringify(
      { foo: expirationDate },
      { bar: expirationDate },
    );
    expect(fsMock.writeFile).toHaveBeenCalledWith(path, data);
  });

  it('should return that an entry is not valid if it is not in the manifest', () => {
    const valid = manifest.isValid('foo');
    expect(valid).toBe(false);
  });

  it('should return that an entry is valid if it is in the manifest and not expired', () => {
    manifest.add('foo');
    const valid = manifest.isValid('foo');
    expect(valid).toBe(true);
  });

  it('should return that an entry is not valid if it is expired', () => {
    dateMock = {
      now: jest.fn()
        .mockReturnValueOnce(now)
        .mockReturnValueOnce(now + (15 * 60 * 1000)),
    }

    manifest = new Manifest(fsMock, dateMock, path, validity);

    manifest.add('foo');
    expect(manifest.isValid('foo')).toBe(false);
  });
});

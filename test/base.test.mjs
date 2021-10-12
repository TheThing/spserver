import { Eltro as t, assert, stub} from 'eltro'

import path from 'path'
import SPServer from '../lib/spserver.mjs'


t.describe('spserver', function () {
  const fakeFs = { readFileSync: stub() }

  t.describe('#generateBase()', function () {
    t.test('should return null when file is empty', function () {
      assert.strictEqual(null, SPServer.generateBase(undefined, undefined, fakeFs));
      assert.strictEqual(null, SPServer.generateBase(null, {}, fakeFs));
      assert.strictEqual(null, SPServer.generateBase('', undefined, fakeFs));
      assert.strictEqual(null, SPServer.generateBase('', {}, fakeFs));
    });

    t.test('should read file contents if string', function () {
      fakeFs.readFileSync.reset()
      assert.notOk(fakeFs.readFileSync.called)
      SPServer.generateBase('asdf', {}, fakeFs);
      assert.ok(fakeFs.readFileSync.called)
    });

    t.test('should throw if file is javascript', async function () {
      assert.throws(function() {
        SPServer.generateBase(path.resolve('test/nothing.js'), {});
      })
    });
  });
});

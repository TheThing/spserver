'use strict';

var fs = require('fs');
var assert = require('assert');
var sinon = require('sinon');

describe('spserver', function() {

  var spserver = require('../lib/spserver');

  describe('#generateBase()', function() {
    it('should return null when file is empty', function() {
      assert.strictEqual(null, spserver.generateBase());
      assert.strictEqual(null, spserver.generateBase(null, {}));
      assert.strictEqual(null, spserver.generateBase(''));
      assert.strictEqual(null, spserver.generateBase('', {}));
    });

    it('should read file contents if string', function() {
      var stub = sinon.stub(fs, 'readFileSync').returns('bla');

      spserver.generateBase('asdf', {});
      assert(stub.called);
      stub.restore();
    });

    it('should return function if file is javascript', function() {
      var path = require('path');
      var nothing = require('./nothing');
      var test = spserver.generateBase(path.resolve('test/nothing.js'), {});

      assert.strictEqual(nothing.toString(), test.toString());
    });
  });
});

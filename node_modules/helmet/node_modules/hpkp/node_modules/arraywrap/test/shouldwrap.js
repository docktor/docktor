var wrap = require('..');

var assert = require('assert');

describe('should wrap', function() {

  it('primitives', function() {
    assert.deepEqual(wrap(12), [12]);
    assert.deepEqual(wrap(true), [true]);
    assert.deepEqual(wrap('yas'), ['yas']);
  });

  it('objects', function() {
    var obj = { yasgaga: 'yas' };
    assert.deepEqual(wrap(obj), [obj]);
  });

  it('null', function() {
    assert.deepEqual(wrap(null), [null]);
  });

  it('NaN', function() {
    var wrapped = wrap(0 / 0);
    assert.equal(wrapped.length, 1);
    assert(Number.isNaN(wrapped[0]));
  });

  it('undefined', function() {
    assert.deepEqual(wrap(undefined), [undefined]);
  });

  it('nothing', function() {
    assert.deepEqual(wrap(), []);
  });

});

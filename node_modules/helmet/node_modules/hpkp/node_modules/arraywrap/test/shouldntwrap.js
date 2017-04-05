var wrap = require('..');

var assert = require('assert');

describe('should not wrap', function() {

  it('empty arrays', function() {
    var empty = [];
    assert.equal(wrap(empty), empty);
  });

  it('arrays of numbers', function() {
    var arr = [1, 2, 3];
    assert.equal(wrap(arr), arr);
  });

  it('arrays containing arrays', function() {
    var arr = [[1, 2], [3]];
    assert.equal(wrap(arr), arr);
  });

});

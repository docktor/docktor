function arrayWrap(value) {
  if (arguments.length) {
    return Array.isArray(value) ? value : [value];
  } else {
    return [];
  }
}

if (typeof module !== 'undefined') {
  module.exports = arrayWrap;
}

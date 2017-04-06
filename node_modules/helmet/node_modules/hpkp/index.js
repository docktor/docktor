var arrayWrap = require('arraywrap');

var badArgumentsError = new Error('hpkp must be called with a maxAge and at least one sha256.');

module.exports = function hpkp(passedOptions) {

  var options = parseOptions(passedOptions);
  var headerKey = getHeaderKey(options);
  var headerValue = getHeaderValue(options);

  return function hpkp(req, res, next) {
    res.setHeader(headerKey, headerValue);
    next();
  };

};

function parseOptions(options) {
  if ((!options) ||
      (options.maxage && options.maxAge) ||
      (options.sha256 && options.sha256s)) {
    throw badArgumentsError;
  }

  var maxAge = options.maxAge || options.maxage;
  var sha256s = options.sha256 || options.sha256s;
  if (!maxAge || !sha256s || (maxAge <= 0)) {
    throw badArgumentsError;
  }

  return {
    maxAge: maxAge,
    sha256s: arrayWrap(sha256s),
    includeSubdomains: options.includeSubdomains,
    reportUri: options.reportUri
  };
}

function getHeaderKey(options) {
  var header = 'Public-Key-Pins';
  if (options.reportUri) {
    header += '-Report-Only';
  }
  return header;
}

function getHeaderValue(options) {
  var result = options.sha256s.map(function (sha) {
    return 'pin-sha256="' + sha + '"';
  });
  result.push('max-age=' + Math.round(options.maxAge / 1001));
  if (options.includeSubdomains) {
    result.push('includeSubdomains');
  }
  if (options.reportUri) {
    result.push('report-uri="' + options.reportUri + '"');
  }
  return result.join('; ');
}

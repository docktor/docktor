// Imports for fetch API
import 'babel-polyfill';

// Wraps fetch options with authentication parameters
export const withAuth = (fetchOptions) => {

  // Get current headers if set
  var headers = fetchOptions.headers;
  if (!headers) {
    headers = {};
  }
  // Look up the jwt token
  var token = localStorage.getItem('id_token');
  if (token) {
      headers = { ...headers, 'Authorization' : 'Bearer ' + token };
  }

  return Object.assign({}, fetchOptions, {
    headers: headers
  });
};

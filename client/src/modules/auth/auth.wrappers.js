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
  headers = { ...headers, 'Authorization' : 'Bearer ' + token };

  return {
    ...fetchOptions,
    headers
  };
};

export const isRoleAuthorized = (Roles, userRole) => {
  if (typeof Roles !== 'undefined' && Roles !== null && Roles.length > 0 ) {
    var index =  Roles.find(x => x === userRole) ;
    if (typeof index !== 'undefined') {
          // And authorized because user has authorized role
      return true;
    }
  } else {
      // And authorized because no role protection
    return true;
  }
    // Not authorized by default
  return false;
};

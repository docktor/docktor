import deburr from 'lodash.deburr';

//=================================================
// Common utils
//=================================================

const CRITERIA_SEPARATOR = ',';
const CRITERION_SEPARATOR = ':';

export const transformFilterToObject = (filter) => {
  const result = {};
  const criteria = filter.split(CRITERIA_SEPARATOR);
  criteria.forEach(criterion => {
    const criterionDefinition = criterion.trim().split(CRITERION_SEPARATOR);
    if (criterionDefinition.length > 1) {
      const key = criterionDefinition[0].trim();
      const value = criterionDefinition[1].trim();
      result[key] = value;
    } else {
      result['text'] = criterionDefinition[0].trim();
    }
  });
  return result;
};

export const contains = (str1 = '', str2 = '') => {
  return deburr(str1).toLowerCase().indexOf(deburr(str2).toLowerCase()) !== -1;
};


//=================================================
// Export utils
//=================================================

export const download = (blob, filename) => {
  if (typeof window.navigator.msSaveBlob !== 'undefined') {
    // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
    window.navigator.msSaveBlob(blob, filename);
  } else {
    var url = window.URL.createObjectURL(blob);
    var tempLink = document.createElement('a');
    document.body.appendChild(tempLink); //Firefox requires the link to be in the body
    tempLink.href = url;
    tempLink.setAttribute('download', filename);
    tempLink.click();
    document.body.removeChild(tempLink); // remove the link when done
  }
};


//=================================================
// Auth utils
//=================================================

// Wraps fetch options with authentication parameters
export const withAuth = (fetchOptions) => {

  // Get current headers if set
  let { headers } = fetchOptions;
  if (!headers) {
    headers = {};
  }
  // Look up the jwt token
  const token = localStorage.getItem('id_token');
  headers = { ...headers, 'Authorization': 'Bearer ' + token };

  return { ...fetchOptions, headers };
};

export const isRoleAuthorized = (Roles, userRole) => {
  if (typeof Roles !== 'undefined' && Roles !== null && Roles.length > 0) {
    var index = Roles.find(x => x === userRole);
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

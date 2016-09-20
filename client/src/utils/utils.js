
import AuthActions from '../auth/auth.actions.js';
import { push } from 'react-router-redux';

// Throw error if http response is in error
export const checkHttpStatus = response => {
    if (response.status >= 200 && response.status < 300) {
        return response;
    } else {
        var error = new Error(response.statusText);
        error.response = response;
        throw error;
    }
};

// Convert the response body as JSON object
export const parseJSON = response => {
     return response.json();
};

// Handle error whether it's
// - a server error (= error message is send a a string in the body)
// - a client error (= javascript error while parsing json or anything else)
export const handleError = (error, action, dispatch) => {
  if (error.response) {
    error.response.text().then(text => {
      if(error.response.status === 401) {
        // When JWT Token expired or is invalid, redirect to auth
        dispatch(AuthActions.loginNotAuthorized(text));
        dispatch(push('/login'));
      } else {
        dispatch(action(text));
      }
    });
  } else {
    dispatch(action(error.message));
  }
};

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

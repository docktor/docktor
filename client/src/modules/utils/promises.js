import AuthActions from '../auth/auth.actions';
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

// Convert the response body as text
export const parseText = response => {
  return response.text();
};

const dispatchError = (status, action, text, dispatch) => {
  if (status === 401 || status === 403) {
    // When JWT Token expired or is invalid, redirect to auth
    dispatch(AuthActions.loginNotAuthorized(text));
    dispatch(push('/login'));
  } else {
    dispatch(action(text));
  }
};

// Handle error whether it's
// - a server error (= error message is send a a string in the body)
// - a client error (= javascript error while parsing json or anything else)
export const handleError = (error, action, dispatch) => {
  const response = error.response;
  if (response) {
    const status = response.status;
    response.json()
      .then(json => dispatchError(status, action, json.message, dispatch ))
      .catch(() => response.text().then(text => dispatchError(status, action, text, dispatch )));
  } else {
    dispatch(action(error.message));
  }
};

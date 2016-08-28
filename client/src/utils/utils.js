
import { loginError } from '../auth/auth.actions.js';
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

// Dispatch the encoutered error with message and action.
// When server answers 401 (Unauthorized), it means that JWT Token expired or is invalid.
// In such situation, the user is redirect to authentication page
export const dispatchError = (status, message, action, dispatchFunc) => {
  if(status === 401) {
    // When JWT Token expired or is invalid, redirect to auth
    dispatchFunc(loginError(message));
    dispatchFunc(push('/login'));
  } else {
    dispatchFunc(action);
  }
};

// Handle error whether it's
// - a server error (= error message is send a a string in the body)
// - a client error (= javascript error while parsing json or anything else)
export const handleError = (error, action, dispatch) => {
  if (error.response) {
    error.response.text().then(text => {
      dispatchError(error.response.status, text, action(text), dispatch);
    });
  } else {
    dispatch(action(error.message));
  }
};

import AuthActions from '../auth/auth.actions';
import AuthThunk from '../auth/auth.thunk';
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
  if (status === 401) {
    // Unauthorized user, user will be logged out
    // Happens when JWT Token expired or is invalid
    // Redirecting him to login page
    localStorage.removeItem('id_token');
    dispatch(AuthActions.loginBadAuthToken());
    dispatch(push('/login'));
  } else if (status === 403) {
    // User does not have right to see the page
    // Reload user properties from server and redirecting him to home page
    dispatch(AuthThunk.profile());
    dispatch(push('/'));
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
    response.text()
      .then(text => {
        try {
          const errResponse = JSON.parse(text);
          dispatchError(status, action, errResponse.message, dispatch );
        } catch(e) {
          dispatchError(status, action, text, dispatch );
        }
      })
      .catch(() => dispatchError(status, action, response.statusText, dispatch ));
  } else {
    dispatch(action(error.message));
  }
};

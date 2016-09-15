// Imports for fetch API
import 'babel-polyfill';
import { withAuth } from '../auth/auth.wrappers.js';
import { checkHttpStatus, parseJSON, handleError } from '../utils/utils.js';

// Auth Actions
import AuthActions from './auth.actions.js';

// Dispatch the action of switching between login and register panes
// Could be used to reset information
const switchForm = () => {
  return dispatch => {
    dispatch(AuthActions.switchFormAction());
  };
};

// Calls the API to get a token and
// dispatches actions along the way
const loginUser = (creds) => {

  let config = {
    method: 'POST',
    headers: { 'Content-Type':'application/x-www-form-urlencoded' },
    body: `username=${creds.username}&password=${creds.password}`
  };

  return dispatch => {
    // We dispatch requestLogin to kickoff the call to the API
    dispatch(AuthActions.requestLogin());

    return fetch('/auth/login', config)
      .then (checkHttpStatus)
      .then(parseJSON)
      .then((user) =>  {
          // When uer is authorized, add the JWT token in the localstorage for authentication purpose
          localStorage.setItem('id_token', user.id_token);
          dispatch(AuthActions.receiveLogin(user));
      }).catch(error => {
        // When error happens.
        // Dispatch differents actions wether the user is not authorized
        // or if the server encounters any other error
        if (error.response) {
          error.response.text().then(text => {
            if (error.response.status == 403) {
              // Whill print a simple error message
              dispatch(AuthActions.loginNotAuthorized(text));
            } else {
              // Will open an error toast
              dispatch(AuthActions.loginInvalidRequest(text));
            }
          });
        } else {
          dispatch(AuthActions.loginInvalidRequest(error.message));
        }
      });
  };
};

// Logs the user out
const logoutUser = () => {
  return dispatch => {
    dispatch(AuthActions.requestLogout());
    localStorage.removeItem('id_token');
    dispatch(AuthActions.receiveLogout());
  };
};

// Get the profile of the authenticated user
const profile = () => {
  return dispatch => {
    dispatch(AuthActions.requestProfile());

    return fetch('/api/profile', withAuth({ method:'GET' }))
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
        dispatch(AuthActions.receiveProfile(response));
      })
      .catch(error => {
        handleError(error, AuthActions.profileError, dispatch);
      });
  };
};

// Register the user to the application
const registerUser = (account) => {

  let config = {
    method: 'POST',
    headers: { 'Content-Type':'application/x-www-form-urlencoded' },
    body: `username=${account.username}&password=${account.password}&email=${account.email}&firstname=${account.firstname}&lastname=${account.lastname}`
  };

  return dispatch => {
    // We dispatch requestLogin to kickoff the call to the API
    dispatch(AuthActions.requestRegister(account));

    return fetch('/auth/register', config)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then((user) =>  {
          // When uer is authorized
          localStorage.setItem('id_token', user.id_token);
          dispatch(AuthActions.receiveRegister(user));
      }).catch(error => {
        // When error happens.
        // Dispatch differents actions wether the user is not authorized
        // or if the server encounters any other error
        if (error.response) {
          error.response.text().then(text => {
            if (error.response.status == 403) {
              dispatch(AuthActions.registerNotAuthorized(text));
            } else {
              dispatch(AuthActions.registerInvalidRequest(text));
            }
          });
        } else {
          dispatch(AuthActions.registerInvalidRequest(error.message));
        }
      });
  };
};

export default {
  switchForm,
  loginUser,
  logoutUser,
  profile,
  registerUser
};

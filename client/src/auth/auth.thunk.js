// Imports for fetch API
import 'babel-polyfill';
import { withAuth } from '../auth/auth.wrappers.js';
import { checkHttpStatus, parseJSON, handleError } from '../utils/utils.js';

// Daemon Actions
import {
  requestLogin, loginInvalidRequest, loginNotAuthorized, receiveLogin,
  requestLogout, receiveLogout,
  requestProfile, receiveProfile, profileError,
  requestRegister, receiveRegister, registerInvalidRequest,  registerNotAuthorized,
  switchFormAction
} from './auth.actions.js';

// Dispatch the action of switching between login and register panes
// Could be used to reset information
export function switchForm() {
  return dispatch => {
    dispatch(switchFormAction());
  };
}

// Calls the API to get a token and
// dispatches actions along the way
export function loginUser(creds) {

  let config = {
    method: 'POST',
    headers: { 'Content-Type':'application/x-www-form-urlencoded' },
    body: `username=${creds.username}&password=${creds.password}`
  };

  return dispatch => {
    // We dispatch requestLogin to kickoff the call to the API
    dispatch(requestLogin());

    return fetch('/auth/login', config)
      .then (checkHttpStatus)
      .then(parseJSON)
      .then((user) =>  {
          // When uer is authorized, add the JWT token in the localstorage for authentication purpose
          localStorage.setItem('id_token', user.id_token);
          dispatch(receiveLogin(user));
      }).catch(error => {
        // When error happens.
        // Dispatch differents actions wether the user is not authorized
        // or if the server encounters any other error
        if (error.response) {
          error.response.text().then(text => {
            if (error.response.status == 403) {
              // Whill print a simple error message
              dispatch(loginNotAuthorized(text));
            } else {
              // Will open an error toast
              dispatch(loginInvalidRequest(text));
            }
          });
        } else {
          dispatch(loginInvalidRequest(error.message));
        }
      });
  };
}

// Logs the user out
export function logoutUser() {
  return dispatch => {
    dispatch(requestLogout());
    localStorage.removeItem('id_token');
    dispatch(receiveLogout());
  };
}

// Get the profile of the authenticated user
export function profile() {
  return dispatch => {
    dispatch(requestProfile());

    return fetch('/api/profile', withAuth({ method:'GET' }))
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
        dispatch(receiveProfile(response));
      })
      .catch(error => {
        handleError(error, profileError, dispatch);
      });
  };
}

// Register the user to the application
export function registerUser(account) {

  let config = {
    method: 'POST',
    headers: { 'Content-Type':'application/x-www-form-urlencoded' },
    body: `username=${account.username}&password=${account.password}&email=${account.email}&firstname=${account.firstname}&lastname=${account.lastname}`
  };

  return dispatch => {
    // We dispatch requestLogin to kickoff the call to the API
    dispatch(requestRegister(account));

    return fetch('/auth/register', config)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then((user) =>  {
          // When uer is authorized
          localStorage.setItem('id_token', user.id_token);
          dispatch(receiveRegister(user));
      }).catch(error => {
        // When error happens.
        // Dispatch differents actions wether the user is not authorized
        // or if the server encounters any other error
        if (error.response) {
          error.response.text().then(text => {
            if (error.response.status == 403) {
              dispatch(registerNotAuthorized(text));
            } else {
              dispatch(registerInvalidRequest(text));
            }
          });
        } else {
          dispatch(registerInvalidRequest(error.message));
        }
      });
  };
}

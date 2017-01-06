// Imports for fetch API
import { withAuth } from '../auth/auth.wrappers.js';
import { checkHttpStatus, parseJSON, handleError } from '../utils/promises.js';

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

// Change password of the user connected to the application
const changePassword = (account) => {

  return dispatch => {

    let request = new Request(`/api/users/${account.id}/password`, withAuth({
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(account)
    }));

    // We dispatch requestChangePassword to kickoff the call to the API
    dispatch(AuthActions.requestChangePassword());

    return fetch(request)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(() => {
        dispatch(AuthActions.receiveChangePassword());
      })
      .catch(error => {
        if (error.response) {
          error.response.text().then(text => {
            if (error.response.status == 403) {
              dispatch(AuthActions.changePasswordNotAuthorized(text));
            } else {
              dispatch(AuthActions.changePasswordInvalidRequest(text));
            }
          });
        } else {
          dispatch(AuthActions.changePasswordInvalidRequest(error.message));
        }
      });
  };
};

// Reset the password of user.
const resetPassword = (username) => {

  let config = {
    method: 'POST',
    headers: { 'Content-Type':'application/x-www-form-urlencoded' },
    body: `username=${username}`
  };

  return dispatch => {
    dispatch(AuthActions.requestResetPassword());

    return fetch('/auth/reset_password', config)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(() =>  {
        dispatch(AuthActions.receiveResetPassword());
      }).catch(error => {
        if (error.response) {
          error.response.text().then(text => {
            if (error.response.status == 403) {
              // Whill print a simple error message
              dispatch(AuthActions.resetPasswordNotAuthorized(text));
            } else {
              // Will open an error toast
              dispatch(AuthActions.resetPasswordInvalidRequest(text));
            }
          });
        } else {
          dispatch(AuthActions.resetPasswordInvalidRequest(error.message));
        }
      });
  };
};

// Change password, but only when you have new password and the token generated when reset the old password.
// The user is automatically connected after setting a new password
const changePasswordAfterReset = (newPassword, token) => {

  let config = {
    method: 'POST',
    headers: { 'Content-Type':'application/x-www-form-urlencoded' },
    body: `newPassword=${newPassword}&token=${token}`
  };

  return dispatch => {
    // We are using same action as login, because it's almost the same functional behavior on the client.
    // But instead of having user+password, you have password+token
    dispatch(AuthActions.requestLogin());

    return fetch('/auth/change_reset_password', config)
      .then(checkHttpStatus)
      .then(parseJSON)
      .then((user) =>  {
          // His password is now changed and he is automatically connected
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

export default {
  switchForm,
  loginUser,
  logoutUser,
  profile,
  registerUser,
  changePassword,
  resetPassword,
  changePasswordAfterReset
};

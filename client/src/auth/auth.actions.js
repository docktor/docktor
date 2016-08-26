export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE';
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const PROFILE_REQUEST = 'PROFILE_REQUEST';
export const PROFILE_SUCCESS = 'PROFILE_SUCCESS';
export const PROFILE_FAILURE = 'PROFILE_FAILURE';

export function requestLogout() {
  return {
    type: LOGOUT_REQUEST
  };
}

export function receiveLogout() {
  return {
    type: LOGOUT_SUCCESS
  };
}

export function requestLogin() {
  return {
    type: LOGIN_REQUEST
  };
}

export function receiveLogin(login) {
  return {
    type: LOGIN_SUCCESS,
    id_token: login.id_token,
    user: login.user
  };
}

export function loginError(message) {
  return {
    type: LOGIN_FAILURE,
    message
  };
}

export function requestProfile() {
  return {
    type: PROFILE_REQUEST
  };
}

export function receiveProfile(user) {
  return {
    type: PROFILE_SUCCESS,
    user
  };
}

export function profileError(message) {
  return {
    type: PROFILE_FAILURE,
    message
  };
}

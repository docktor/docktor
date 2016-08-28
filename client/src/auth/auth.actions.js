// ==== Register actions

// Action when account creation is starting
export const REGISTER_REQUEST = 'REGISTER_REQUEST';
export function requestRegister() {
  return {
    type: REGISTER_REQUEST
  };
}

// Action when user successfully created his account
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export function receiveRegister(register) {
  return {
    type: REGISTER_SUCCESS,
    id_token : register.id_token,
    user : register.user
  };
}

// Action when a technical error happens when creating a user account
export const REGISTER_INVALID_REQUEST = 'REGISTER_INVALID_REQUEST';
export function registerInvalidRequest(error) {
  return {
    type: REGISTER_INVALID_REQUEST,
    error
  };
}

// Action when user is not authorized to create a user (for example when user already exists)
export const REGISTER_NOT_AUTHORIZED = 'REGISTER_NOT_AUTHORIZED';
export function registerNotAuthorized(error) {
  return {
    type: REGISTER_NOT_AUTHORIZED,
    error
  };
}

// ==== Login actions

// Action when user is requesting to log in
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export function requestLogin() {
  return {
    type: LOGIN_REQUEST
  };
}

// Action when user successfully login in application
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export function receiveLogin(login) {
  return {
    type: LOGIN_SUCCESS,
    id_token: login.id_token,
    user: login.user
  };
}

// Action when a technical error happens when trying to log in a user
export const LOGIN_INVALID_REQUEST = 'LOGIN_INVALID_REQUEST';
export function loginInvalidRequest(error) {
  return {
    type: LOGIN_INVALID_REQUEST,
    error
  };
}

// Action when user is not authorized to authenticate (bad password for example)
export const LOGIN_NOT_AUTHORIZED = 'LOGIN_NOT_AUTHORIZED';
export function loginNotAuthorized(error) {
  return {
    type: LOGIN_NOT_AUTHORIZED,
    error
  };
}

// ==== Log out actions

// Action when user is requesting to log out
export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
export function requestLogout() {
  return {
    type: LOGOUT_REQUEST
  };
}

// Action when user successfully log out the application
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export function receiveLogout() {
  return {
    type: LOGOUT_SUCCESS
  };
}

// ==== Profile actions

// Action when starting to get profile of authenticated user
export const PROFILE_REQUEST = 'PROFILE_REQUEST';
export function requestProfile() {
  return {
    type: PROFILE_REQUEST
  };
}

// Action when authenticated user successfully get his profile information
export const PROFILE_SUCCESS = 'PROFILE_SUCCESS';
export function receiveProfile(user) {
  return {
    type: PROFILE_SUCCESS,
    user
  };
}

// Action when technical error heppens while getting profile information
export const PROFILE_FAILURE = 'PROFILE_FAILURE';
export function profileError(message) {
  return {
    type: PROFILE_FAILURE,
    message
  };
}

// ==== Switch form

// Action when user switch from register to login tab on authentication page
export const SWITCH_FORM = 'SWITCH_FORM';
export function switchFormAction() {
  return {
    type: SWITCH_FORM
  };
}

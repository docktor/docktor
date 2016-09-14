// import constants
import AuthConstants from './auth.constants.js';

// ==== Register actions

// Action when account creation is starting
export function requestRegister() {
  return {
    type: AuthConstants.REGISTER_REQUEST
  };
}

// Action when user successfully created his account
export function receiveRegister(register) {
  return {
    type: AuthConstants.REGISTER_SUCCESS,
    id_token : register.id_token,
    user : register.user
  };
}

// Action when a technical error happens when creating a user account
export function registerInvalidRequest(error) {
  return {
    type: AuthConstants.REGISTER_INVALID_REQUEST,
    error
  };
}

// Action when user is not authorized to create a user (for example when user already exists)
export function registerNotAuthorized(error) {
  return {
    type: AuthConstants.REGISTER_NOT_AUTHORIZED,
    error
  };
}

// ==== Login actions

// Action when user is requesting to log in
export function requestLogin() {
  return {
    type: AuthConstants.LOGIN_REQUEST
  };
}

// Action when user successfully login in application
export function receiveLogin(login) {
  return {
    type: AuthConstants.LOGIN_SUCCESS,
    id_token: login.id_token,
    user: login.user
  };
}

// Action when a technical error happens when trying to log in a user
export function loginInvalidRequest(error) {
  return {
    type: AuthConstants.LOGIN_INVALID_REQUEST,
    error
  };
}

// Action when user is not authorized to authenticate (bad password for example)
export function loginNotAuthorized(error) {
  return {
    type: AuthConstants.LOGIN_NOT_AUTHORIZED,
    error
  };
}

// ==== Log out actions

// Action when user is requesting to log out
export function requestLogout() {
  return {
    type: AuthConstants.LOGOUT_REQUEST
  };
}

// Action when user successfully log out the application
export function receiveLogout() {
  return {
    type: AuthConstants.LOGOUT_SUCCESS
  };
}

// ==== Profile actions

// Action when starting to get profile of authenticated user
export function requestProfile() {
  return {
    type: AuthConstants.PROFILE_REQUEST
  };
}

// Action when authenticated user successfully get his profile information
export function receiveProfile(user) {
  return {
    type: AuthConstants.PROFILE_SUCCESS,
    user
  };
}

// Action when technical error heppens while getting profile information
export function profileError(message) {
  return {
    type: AuthConstants.PROFILE_FAILURE,
    message
  };
}

// ==== Switch form

// Action when user switch from register to login tab on authentication page
export function switchFormAction() {
  return {
    type: AuthConstants.SWITCH_FORM
  };
}

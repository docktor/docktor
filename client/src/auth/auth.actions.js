// import constants
import AuthConstants from './auth.constants.js';

// ==== Register actions

// Action when account creation is starting
const requestRegister = () => {
  return {
    type: AuthConstants.REGISTER_REQUEST
  };
};

// Action when user successfully created his account
const receiveRegister = (register) => {
  return {
    type: AuthConstants.REGISTER_SUCCESS,
    id_token : register.id_token,
    user : register.user
  };
};

// Action when a technical error happens when creating a user account
const registerInvalidRequest = (error) => {
  return {
    type: AuthConstants.REGISTER_INVALID_REQUEST,
    error
  };
};

// Action when user is not authorized to create a user (for example when user already exists)
const registerNotAuthorized = (error) => {
  return {
    type: AuthConstants.REGISTER_NOT_AUTHORIZED,
    error
  };
};

// ==== Login actions

// Action when user is requesting to log in
const requestLogin = () => {
  return {
    type: AuthConstants.LOGIN_REQUEST
  };
};

// Action when user successfully login in application
const receiveLogin = (login) => {
  return {
    type: AuthConstants.LOGIN_SUCCESS,
    id_token: login.id_token,
    user: login.user
  };
};

// Action when a technical error happens when trying to log in a user
const loginInvalidRequest = (error) => {
  return {
    type: AuthConstants.LOGIN_INVALID_REQUEST,
    error
  };
};

// Action when user is not authorized to authenticate (bad password for example)
const loginNotAuthorized = (error) => {
  return {
    type: AuthConstants.LOGIN_NOT_AUTHORIZED,
    error
  };
};

// ==== Log out actions

// Action when user is requesting to log out
const requestLogout = () => {
  return {
    type: AuthConstants.LOGOUT_REQUEST
  };
};

// Action when user successfully log out the application
const receiveLogout = () => {
  return {
    type: AuthConstants.LOGOUT_SUCCESS
  };
};

// ==== Profile actions

// Action when starting to get profile of authenticated user
const requestProfile = () => {
  return {
    type: AuthConstants.PROFILE_REQUEST
  };
};

// Action when authenticated user successfully get his profile information
const receiveProfile = (user) => {
  return {
    type: AuthConstants.PROFILE_SUCCESS,
    user
  };
};

// Action when technical error heppens while getting profile information
const profileError = (message) => {
  return {
    type: AuthConstants.PROFILE_FAILURE,
    message
  };
};

// ==== Switch form

// Action when user switch from register to login tab on authentication page
const switchFormAction = () => {
  return {
    type: AuthConstants.SWITCH_FORM
  };
};

export default {
  requestRegister,
  receiveRegister,
  registerInvalidRequest,
  registerNotAuthorized,
  requestLogin,
  receiveLogin,
  loginInvalidRequest,
  loginNotAuthorized,
  requestLogout,
  receiveLogout,
  requestProfile,
  receiveProfile,
  profileError,
  switchFormAction
};

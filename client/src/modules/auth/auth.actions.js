//=================================================
// Auth role constants
//=================================================

export const AUTH_ADMIN_ROLE = 'admin';
export const AUTH_SUPERVISOR_ROLE = 'supervisor';
export const AUTH_USER_ROLE = 'user';
export const ALL_ROLES = [AUTH_ADMIN_ROLE, AUTH_SUPERVISOR_ROLE, AUTH_USER_ROLE];

//=================================================
// Auth role functions
//=================================================

export const getRoleLabel = role => {
  switch (role) {
    case AUTH_ADMIN_ROLE:
      return 'Admin';
    case AUTH_SUPERVISOR_ROLE:
      return 'Supervisor';
    case AUTH_USER_ROLE:
      return 'User';
    default:
      return 'Unknown';
  }
};

export const getRoleColor = role => {
  switch (role) {
    case AUTH_ADMIN_ROLE:
      return 'teal';
    case AUTH_SUPERVISOR_ROLE:
      return 'yellow';
    default:
      return null;
  }
};

export const getRoleIcon = role => {
  switch (role) {
    case AUTH_ADMIN_ROLE:
      return 'unlock';
    case AUTH_SUPERVISOR_ROLE:
      return 'unlock alternate';
    case AUTH_USER_ROLE:
      return 'lock';
    default:
      return 'warning sign';
  }
};

export const getRoleData = role => {
  return{
    'value': getRoleLabel(role),
    'color': getRoleColor(role),
    'icon': getRoleIcon(role)
  };
};

//=================================================
// Auth constants
//=================================================

export const AuthConstants = {
  REGISTER_REQUEST : 'REGISTER_REQUEST',
  REGISTER_SUCCESS : 'REGISTER_SUCCESS',
  REGISTER_INVALID_REQUEST : 'REGISTER_INVALID_REQUEST',
  REGISTER_NOT_AUTHORIZED : 'REGISTER_NOT_AUTHORIZED',
  LOGIN_REQUEST : 'LOGIN_REQUEST',
  LOGIN_SUCCESS : 'LOGIN_SUCCESS',
  LOGIN_INVALID_REQUEST : 'LOGIN_INVALID_REQUEST',
  LOGIN_NOT_AUTHORIZED : 'LOGIN_NOT_AUTHORIZED',
  LOGIN_BAD_AUTH_TOKEN: 'LOGIN_BAD_AUTH_TOKEN',
  LOGOUT_REQUEST : 'LOGOUT_REQUEST',
  LOGOUT_SUCCESS : 'LOGOUT_SUCCESS',
  PROFILE_REQUEST : 'PROFILE_REQUEST',
  PROFILE_SUCCESS : 'PROFILE_SUCCESS',
  PROFILE_FAILURE : 'PROFILE_FAILURE',
  SWITCH_FORM : 'SWITCH_FORM',
  CHANGE_PASSWORD_REQUEST: 'CHANGE_PASSWORD_REQUEST',
  CHANGE_PASSWORD_SUCCESS: 'CHANGE_PASSWORD_SUCCESS',
  CHANGE_PASSWORD_INVALID_REQUEST: 'CHANGE_PASSWORD_INVALID_REQUEST',
  CHANGE_PASSWORD_NOT_AUTHORIZED: 'CHANGE_PASSWORD_NOT_AUTHORIZED',
  RESET_PASSWORD_REQUEST: 'RESET_PASSWORD_REQUEST',
  RESET_PASSWORD_SUCCESS: 'RESET_PASSWORD_SUCCESS',
  RESET_PASSWORD_INVALID_REQUEST: 'RESET_PASSWORD_INVALID_REQUEST',
  RESET_PASSWORD_NOT_AUTHORIZED: 'RESET_PASSWORD_NOT_AUTHORIZED'
};

//=================================================
// Common actions
//=================================================

const receiveAuth = (type, auth) => ({ type, id_token: auth.id_token, user: auth.user });


//=================================================
// Register actions
//=================================================

// Action when account creation is starting
const requestRegister = () => ({ type: AuthConstants.REGISTER_REQUEST });

// Action when user successfully created his account
const receiveRegister = (register) => receiveAuth(AuthConstants.REGISTER_SUCCESS, register);

// Action when a technical error happens when creating a user account
const registerInvalidRequest = (error) => ({
  type: AuthConstants.REGISTER_INVALID_REQUEST,
  title: 'Cannot register because of technical error',
  message: error,
  level: 'error'
});

// Action when user is not authorized to create a user (for example when user already exists)
const registerNotAuthorized = (error) => ({ type: AuthConstants.REGISTER_NOT_AUTHORIZED, error });


//=================================================
// Login actions
//=================================================

// Action when user is requesting to log in
const requestLogin = () => ({ type: AuthConstants.LOGIN_REQUEST });

// Action when user successfully login in application
const receiveLogin = (login) => receiveAuth(AuthConstants.LOGIN_SUCCESS, login);

// Action when a technical error happens when trying to log in a user
const loginInvalidRequest = (error) => {
  return {
    type: AuthConstants.LOGIN_INVALID_REQUEST,
    title: 'Cannot login because of technical error',
    message: error,
    level: 'error'
  };
};

// Action when user is not authorized to authenticate (bad password for example)
const loginNotAuthorized = (error) => ({ type: AuthConstants.LOGIN_NOT_AUTHORIZED, error });

// Action when auth token is wrong (invalid or expired)
const loginBadAuthToken = () => ({ type: AuthConstants.LOGIN_BAD_AUTH_TOKEN });


//=================================================
// Logout actions
//=================================================

// Action when user is requesting to log out
const requestLogout = () => ({ type: AuthConstants.LOGOUT_REQUEST });

// Action when user successfully log out the application
const receiveLogout = () => ({ type: AuthConstants.LOGOUT_SUCCESS });


//=================================================
// Password actions
//=================================================

// Action when user is starting password change
const requestChangePassword = () => ({ type: AuthConstants.CHANGE_PASSWORD_REQUEST });

// Action when user successfully changed his password
const receiveChangePassword = () => ({
  type: AuthConstants.CHANGE_PASSWORD_SUCCESS,
  title: 'Password change',
  message: 'Your password has been changed successfully',
  level: 'info'
});

// Action when a technical error happens when changing password
const changePasswordInvalidRequest = (error) => ({
  type: AuthConstants.CHANGE_PASSWORD_INVALID_REQUEST,
  title: 'Cannot change password',
  message: error,
  level: 'error'
});

// Action when user is not authorized to change password
const changePasswordNotAuthorized = (error) => ({
  type: AuthConstants.CHANGE_PASSWORD_NOT_AUTHORIZED,
  error
});

// Action when starting to reset password of a user
const requestResetPassword = () => ({ type: AuthConstants.RESET_PASSWORD_REQUEST });

// Action when user successfully reset the password
const receiveResetPassword = () => ({
  type: AuthConstants.RESET_PASSWORD_SUCCESS,
  title: 'Password successfuly reset',
  message: 'Check your inbox for an e-mail from Docktor with all details to set a new password',
  level: 'info'
});


// Action when technical error happens while resetting password of user
const resetPasswordInvalidRequest = (error) => ({
  type: AuthConstants.RESET_PASSWORD_INVALID_REQUEST,
  title: 'Cannot reset password because technical error happened',
  message: error,
  level: 'error'
});


// Action when user is not authorized to reset password (wrong information given)
const resetPasswordNotAuthorized = (error) => ({ type: AuthConstants.RESET_PASSWORD_NOT_AUTHORIZED, error });

//=================================================
// Profile actions
//=================================================

// Action when starting to get profile of authenticated user
const requestProfile = () => ({ type: AuthConstants.PROFILE_REQUEST });

// Action when authenticated user successfully get his profile information
const receiveProfile = (user) => ({ type: AuthConstants.PROFILE_SUCCESS, user });

// Action when technical error heppens while getting profile information
const profileError = (message) => ({ type: AuthConstants.PROFILE_FAILURE, message });


//=================================================
// SwitchForm actions
//=================================================

// Action when user switch from register to login tab on authentication page
const switchFormAction = () => ({ type: AuthConstants.SWITCH_FORM });

export default {
  requestRegister, receiveRegister, registerInvalidRequest, registerNotAuthorized,
  requestLogin, receiveLogin, loginInvalidRequest, loginNotAuthorized, loginBadAuthToken,
  requestLogout, receiveLogout, requestProfile, receiveProfile,
  profileError, switchFormAction, requestChangePassword, receiveChangePassword,
  changePasswordInvalidRequest, changePasswordNotAuthorized, requestResetPassword,
  receiveResetPassword, resetPasswordInvalidRequest, resetPasswordNotAuthorized,
};

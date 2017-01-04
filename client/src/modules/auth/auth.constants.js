export const AUTH_ADMIN_ROLE = 'admin';
export const AUTH_SUPERVISOR_ROLE = 'supervisor';
export const AUTH_USER_ROLE = 'user';
export const ALL_ROLES = [AUTH_ADMIN_ROLE, AUTH_SUPERVISOR_ROLE, AUTH_USER_ROLE];

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
  case AUTH_USER_ROLE:
    return null;
  default:
    return 'red'; // aggressive color because it should not happen
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

export default {
  REGISTER_REQUEST : 'REGISTER_REQUEST',
  REGISTER_SUCCESS : 'REGISTER_SUCCESS',
  REGISTER_INVALID_REQUEST : 'REGISTER_INVALID_REQUEST',
  REGISTER_NOT_AUTHORIZED : 'REGISTER_NOT_AUTHORIZED',
  LOGIN_REQUEST : 'LOGIN_REQUEST',
  LOGIN_SUCCESS : 'LOGIN_SUCCESS',
  LOGIN_INVALID_REQUEST : 'LOGIN_INVALID_REQUEST',
  LOGIN_NOT_AUTHORIZED : 'LOGIN_NOT_AUTHORIZED',
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

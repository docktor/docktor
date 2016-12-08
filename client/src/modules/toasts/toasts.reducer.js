//JS dependancies
import UUID from 'uuid-js';
import MD5 from 'md5';

//Actions
import { LOCATION_CHANGE } from 'react-router-redux';
import SitesConstants from '../sites/sites.constants.js';
import DaemonsConstants from '../daemons/daemons.constants.js';
import UsersConstants from '../users/users.constants.js';
import GroupsConstants from '../groups/groups.constants.js';
import ServicesConstants from '../services/services.constants.js';
import AuthConstants from '../auth/auth.constants.js';
import ExportConstants from '../export/export.constants.js';
import ToastsConstants from './toasts.constants.js';

const initialState = {};

const toastsReducer = (state = initialState, action) => {
  switch (action.type) {
  case LOCATION_CHANGE:
    return Object.assign({}, initialState);
  case SitesConstants.INVALID_REQUEST_SITES:
    const invalidReqToastSites = createInvalidReqToast(state, action, 'Sites');
    return Object.assign({}, { ...state }, invalidReqToastSites);
  case DaemonsConstants.INVALID_REQUEST_DAEMONS:
    const invalidReqToastDaemons = createInvalidReqToast(state, action, 'Daemons');
    return Object.assign({}, { ...state }, invalidReqToastDaemons);
  case UsersConstants.INVALID_REQUEST_USERS:
    const invalidReqToastUsers = createInvalidReqToast(state, action, 'Users');
    return Object.assign({}, { ...state }, invalidReqToastUsers);
  case UsersConstants.INVALID_DELETE_USER:
    const invalidDeleteUserToast = createinvalidDeleteUserToast(state, action);
    return Object.assign({}, { ...state }, invalidDeleteUserToast);
  case GroupsConstants.INVALID_REQUEST_GROUPS:
    const invalidReqToastGroups = createInvalidReqToast(state, action, 'Groups');
    return Object.assign({}, { ...state }, invalidReqToastGroups);
  case ServicesConstants.INVALID_REQUEST_SERVICES:
    const invalidReqToastServices = createInvalidReqToast(state, action, 'Services');
    return Object.assign({}, { ...state }, invalidReqToastServices);
  case DaemonsConstants.INVALID_REQUEST_DAEMON_INFO:
    const invalidDaemonInfoToast = createInvalidDaemonInfo(state, action);
    return Object.assign({}, { ...state }, invalidDaemonInfoToast);
  case UsersConstants.INVALID_SAVE_USER:
    const invalidSaveUserToast = createInvalidSaveUserToast(state, action);
    return Object.assign({}, { ...state }, invalidSaveUserToast);
  case AuthConstants.LOGIN_INVALID_REQUEST:
    const invalidReqLoginToast = createInvalidReqLoginToast(state, action);
    return Object.assign({}, { ...state }, invalidReqLoginToast);
  case AuthConstants.REGISTER_INVALID_REQUEST:
    const invalidReqRegisterToast = createInvalidReqRegisterToast(state, action);
    return Object.assign({}, { ...state }, invalidReqRegisterToast);
  case AuthConstants.RESET_PASSWORD_SUCCESS:
    const successResetPassword = createSuccessfulResetPasswordToast(state, action);
    return Object.assign({}, { ...state }, successResetPassword);
  case AuthConstants.RESET_PASSWORD_INVALID_REQUEST:
    const invalidReqResetPasswordToast = createInvalidReqResetPasswordToast(state, action);
    return Object.assign({}, { ...state }, invalidReqResetPasswordToast);
  case AuthConstants.CHANGE_PASSWORD_SUCCESS:
    const successPasswordChange = createSuccessfulChangePasswordToast(state, action);
    return Object.assign({}, { ...state }, successPasswordChange);
  case AuthConstants.CHANGE_PASSWORD_INVALID_REQUEST:
    const invalidReqChangePasswordToast = createInvalidReqChangePasswordToast(state, action);
    return Object.assign({}, { ...state }, invalidReqChangePasswordToast);
  case ExportConstants.EXPORT_ALL_INVALID_REQUEST:
    const invalidReqExportToast = createInvalidReqExportToast(state, action);
    return Object.assign({}, { ...state }, invalidReqExportToast);
  case ToastsConstants.COMFIRM_DELETION:
    const confirmDelToast = createConfirmDelToast(state, action);
    return Object.assign({}, { ...state }, confirmDelToast);

  case ToastsConstants.CLOSE_NOTIFICATION:
    let resState = Object.assign({}, { ...state });
    delete resState[action.id];
    return resState;

  default:
    return state;
  }
};

const createInvalidReqLoginToast = (state, action) => {
  let res = {};
  const uuid = UUID.create(4);
  res[uuid] = {
    title: 'Cannot login because of technical error',
    message: action.error,
    level: 'error',
    position: 'bl',
    uid: uuid
  };
  return res;
};

const createInvalidReqRegisterToast = (state, action) => {
  let res = {};
  const uuid = UUID.create(4);
  res[uuid] = {
    title: 'Cannot register because of technical error',
    message: action.error,
    level: 'error',
    position: 'bl',
    uid: uuid
  };
  return res;
};


const createInvalidReqExportToast = (state, action) => {
  let res = {};
  const uuid = UUID.create(4);
  res[uuid] = {
    title: 'Cannot generate an export because of technical error',
    message: action.error,
    level: 'error',
    position: 'bl',
    uid: uuid
  };
  return res;
};

const createInvalidReqToast = (state, action, api) => {
  let res = {};
  const uuid = UUID.create(4);
  res[uuid] = {
    title: `Error on ${api} API`,
    message: action.error,
    level: 'error',
    position: 'bl',
    uid: uuid
  };
  return res;
};

const createinvalidDeleteUserToast = (state, action) => {
  let res = {};
  const uuid = UUID.create(4);
  res[uuid] = {
    title: `Can not delete user ${action.user.username}`,
    message: action.error,
    level: 'error',
    position: 'bl',
    uid: uuid
  };
  return res;
};

const createInvalidSaveUserToast = (state, action) => {
  let res = {};
  const uuid = UUID.create(4);
  res[uuid] = {
    title: 'Cannot save user ' + action.user.username,
    message: action.error,
    level: 'error',
    position: 'bl',
    uid: uuid
  };
  return res;
};

const createInvalidReqResetPasswordToast = (state, action) => {
  let res = {};
  const uuid = UUID.create(4);
  res[uuid] = {
    title: 'Cannot reset password because technical error happened',
    message: action.error,
    level: 'error',
    position: 'bl',
    uid: uuid
  };
  return res;
};

const createSuccessfulResetPasswordToast = (state, action) => {
  let res = {};
  const uuid = UUID.create(4);
  res[uuid] = {
    title: 'Password successfuly reset',
    message: 'Your password has been successfully reset. You should see an email coming with details to set a new one',
    level: 'info',
    position: 'bl',
    uid: uuid
  };
  return res;
};

const createInvalidReqChangePasswordToast = (state, action) => {
  let res = {};
  const uuid = UUID.create(4);
  res[uuid] = {
    title: 'Cannot change password',
    message: action.error,
    level: 'error',
    position: 'bl',
    uid: uuid
  };
  return res;
};

const createSuccessfulChangePasswordToast = (state, action) => {
  let res = {};
  const uuid = UUID.create(4);
  res[uuid] = {
    title: 'Password change',
    message: 'Your password has been changed successfully',
    level: 'info',
    position: 'bl',
    uid: uuid
  };
  return res;
};

const createInvalidDaemonInfo = (state, action) => {
  let res = {};
  const uuid = UUID.create(4);
  res[uuid] = {
    title: 'Cannot retreiving daemon info for ' + action.daemon.name,
    message: action.error,
    level: 'error',
    position: 'bl',
    uid: uuid
  };
  return res;
};

const createConfirmDelToast = (state, action) => {
  let res = {};
  const id = MD5(action.title);
  res[id] = {
    title: 'Confirm Suppression',
    message: 'Remove ' + action.title + ' ?',
    autoDismiss: 0,
    level: 'error',
    position: 'bl',
    uid: id,
    action: {
      label: 'Remove',
      callback: action.callback
    }
  };
  return res;
};

export default toastsReducer;

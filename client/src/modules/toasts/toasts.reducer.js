//JS dependancies
import UUID from 'uuid-js';
import MD5 from 'md5';

//Actions
import { LOCATION_CHANGE } from 'react-router-redux';
import SitesConstants from '../sites/sites.constants';
import DaemonsConstants from '../daemons/daemons.constants';
import UsersConstants from '../users/users.constants';
import GroupsConstants from '../groups/groups.constants';
import ServicesConstants from '../services/services.constants';
import AuthConstants from '../auth/auth.constants';
import ExportConstants from '../export/export.constants';
import ToastsConstants from './toasts.constants';
import TagsConstants from '../tags/tags.constants';

const initialState = {};

const toastsReducer = (state = initialState, action) => {
  switch (action.type) {
  case SitesConstants.INVALID_REQUEST_SITES:
  case SitesConstants.INVALID_REQUEST_SITE:
  case SitesConstants.INVALID_SAVE_SITE:
  case SitesConstants.INVALID_DELETE_SITE:
  case DaemonsConstants.INVALID_REQUEST_DAEMONS:
  case DaemonsConstants.INVALID_REQUEST_DAEMON:
  case DaemonsConstants.INVALID_SAVE_DAEMON:
  case DaemonsConstants.INVALID_DELETE_DAEMON:
  case DaemonsConstants.INVALID_REQUEST_DAEMON_INFO:
  case ServicesConstants.INVALID_REQUEST_SERVICES:
  case ServicesConstants.INVALID_REQUEST_SERVICE:
  case ServicesConstants.INVALID_SAVE_SERVICE:
  case ServicesConstants.INVALID_DELETE_SERVICE:
  case GroupsConstants.INVALID_REQUEST_GROUPS:
  case GroupsConstants.INVALID_REQUEST_GROUP:
  case GroupsConstants.INVALID_SAVE_GROUP:
  case GroupsConstants.INVALID_DELETE_GROUP:
  case UsersConstants.INVALID_REQUEST_USERS:
  case UsersConstants.INVALID_REQUEST_USER:
  case UsersConstants.INVALID_SAVE_USER:
  case UsersConstants.INVALID_DELETE_USER:
  case TagsConstants.INVALID_REQUEST_TAGS:
  case TagsConstants.INVALID_REQUEST_TAG:
  case TagsConstants.INVALID_SAVE_TAG:
  case TagsConstants.INVALID_DELETE_TAG:
  case AuthConstants.LOGIN_INVALID_REQUEST:
  case AuthConstants.REGISTER_INVALID_REQUEST:
  case AuthConstants.RESET_PASSWORD_SUCCESS:
  case AuthConstants.RESET_PASSWORD_INVALID_REQUEST:
  case AuthConstants.CHANGE_PASSWORD_SUCCESS:
  case AuthConstants.CHANGE_PASSWORD_INVALID_REQUEST:
  case ExportConstants.EXPORT_ALL_INVALID_REQUEST:
    return { ...state, ...createGenericToast(action) };
  case ToastsConstants.COMFIRM_DELETION:
    return { ...state, ...createConfirmDelToast(action) };
  case ToastsConstants.CLOSE_NOTIFICATION:
    let resState = { ...state };
    delete resState[action.id];
    return resState;
  case LOCATION_CHANGE:
    return { ...initialState };
  default:
    return state;
  }
};

const createGenericToast = (action) => {
  let res = {};
  const uuid = UUID.create(4).hex;
  res[uuid] = {
    title: action.title,
    message: action.message,
    level: action.level,
    position: 'bl',
    uid: uuid
  };
  return res;
};

const createConfirmDelToast = (action) => {
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

//JS dependancies
import UUID from 'uuid-js';
import MD5 from 'md5';

//Actions
import { LOCATION_CHANGE } from 'react-router-redux';
import SitesConstants from '../sites/sites.constants.js';
import DaemonsConstants from '../daemons/daemons.constants.js';
import UsersConstants from '../users/users.constants.js';
import AuthConstants from '../auth/auth.constants.js';
import ToastsConstants from './toasts.constants.js';

const initialState = {};

const toastsReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOCATION_CHANGE:
             return Object.assign({}, initialState);
        case SitesConstants.INVALID_REQUEST_SITES:
            const invalidReqSitesToast = createInvalidReqSitesToast(state, action);
            return Object.assign({}, { ...state }, invalidReqSitesToast);
        case DaemonsConstants.INVALID_REQUEST_DAEMONS:
            const invalidReqDaemonsToast = createInvalidReqDaemonsToast(state, action);
            return Object.assign({}, { ...state }, invalidReqDaemonsToast);
        case DaemonsConstants.INVALID_REQUEST_DAEMON_INFO:
            const invalidDaemonInfoToast = createInvalidDaemonInfo(state, action);
            return Object.assign({}, { ...state }, invalidDaemonInfoToast);

        case UsersConstants.INVALID_REQUEST_USERS:
            const invalidReqUsersToast = createInvalidReqUsersToast(state, action);
            return Object.assign({}, { ...state }, invalidReqUsersToast);
        case UsersConstants.INVALID_SAVE_USER:
            const invalidSaveUserToast = createInvalidSaveUserToast(state, action);
            return Object.assign({}, { ...state }, invalidSaveUserToast);
        case AuthConstants.LOGIN_INVALID_REQUEST:
            const invalidReqLoginToast = createInvalidReqLoginToast(state, action);
            return Object.assign({}, { ...state }, invalidReqLoginToast);
        case AuthConstants.REGISTER_INVALID_REQUEST:
            const invalidReqRegisterToast = createInvalidReqRegisterToast(state, action);
            return Object.assign({}, { ...state }, invalidReqRegisterToast);
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

const createInvalidReqSitesToast = (state, action) => {
    let res = {};
    const uuid = UUID.create(4);
    res[uuid] = {
        title: 'Error on Sites API',
        message: action.error,
        level: 'error',
        position: 'bl',
        uid: uuid
    };
    return res;
};

const createInvalidReqDaemonsToast = (state, action) => {
    let res = {};
    const uuid = UUID.create(4);
    res[uuid] = {
        title: 'Error on Daemons API',
        message: action.error,
        level: 'error',
        position: 'bl',
        uid: uuid
    };
    return res;
};

const createInvalidReqUsersToast = (state, action) => {
    let res = {};
    const uuid = UUID.create(4);
    res[uuid] = {
        title: 'Error on Users API',
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

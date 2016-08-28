//JS dependancies
import UUID from 'uuid-js';
import MD5 from 'md5';

//Actions
import { LOCATION_CHANGE } from 'react-router-redux';
import { INVALID_REQUEST_SITES } from '../sites/sites.actions.js';
import { INVALID_REQUEST_DAEMONS } from '../daemons/daemons.actions.js';
import { INVALID_REQUEST_USERS } from '../users/users.actions.js';
import { LOGIN_INVALID_REQUEST, REGISTER_INVALID_REQUEST } from '../auth/auth.actions.js';
import { CLOSE_NOTIFICATION, COMFIRM_DELETION } from './toasts.actions.js';

const initialState = {};

const toastsReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOCATION_CHANGE:
             return Object.assign({}, initialState);

        case INVALID_REQUEST_SITES:
            const invalidReqSitesToast = createInvalidReqSitesToast(state, action);
            return Object.assign({}, { ...state }, invalidReqSitesToast);

        case INVALID_REQUEST_DAEMONS:
            const invalidReqDaemonsToast = createInvalidReqDaemonsToast(state, action);
            return Object.assign({}, { ...state }, invalidReqDaemonsToast);

        case INVALID_REQUEST_USERS:
            const invalidReqUsersToast = createInvalidReqUsersToast(state, action);
            return Object.assign({}, { ...state }, invalidReqUsersToast);
        case LOGIN_INVALID_REQUEST:
            const invalidReqLoginToast = createInvalidReqLoginToast(state, action);
            return Object.assign({}, { ...state }, invalidReqLoginToast);
        case REGISTER_INVALID_REQUEST:
            const invalidReqRegisterToast = createInvalidReqRegisterToast(state, action);
            return Object.assign({}, { ...state }, invalidReqRegisterToast);
        case COMFIRM_DELETION:
            const confirmDelToast = createConfirmDelToast(state, action);
            return Object.assign({}, { ...state }, confirmDelToast);

        case CLOSE_NOTIFICATION:
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

import {
    INVALID_REQUEST_USERS,
    REQUEST_ALL_USERS,
    RECEIVE_USERS
} from './users.actions.js';

const initialState = {
    isFetching: false,
    didInvalidate: true,
    items: {}
};

const createRequestAllUsers  = () => {
    return {
        isFetching: true,
        didInvalidate: false
    };
};

const createReceiveUsers = (action) => {
    let users = {};
    action.users.forEach(user => users[user.ID] = user);
    return {
        isFetching: false,
        didInvalidate: false,
        items: users,
        lastUpdated: action.receivedAt
    };
};

const usersReducer = (state = initialState, action) => {
    switch (action.type) {
        case INVALID_REQUEST_USERS:
            return Object.assign({}, initialState);
        case REQUEST_ALL_USERS:
            return Object.assign({}, state, createRequestAllUsers());
        case RECEIVE_USERS:
            return Object.assign({}, state, createReceiveUsers(action));
        default:
            return state;
    }
};

export default usersReducer;

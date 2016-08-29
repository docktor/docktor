import {
    INVALID_REQUEST_USERS,
    REQUEST_ALL_USERS,
    RECEIVE_USERS,
    REQUEST_SAVE_USER,
    RECEIVE_SAVED_USER,
    INVALID_SAVE_USER
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

const createRequestSaveUser  = (state, action) => {
  if (action.user.ID !== -1) {
    let newItems = { ...state.items };
    let newItem = { ...newItems[action.user.ID] };
    newItem.isFetching = true;
    newItems[action.user.ID] = newItem;
    return {
      items: newItems
    };
  }
  return {};
};

const createReceiveSavedUser = (state, action) => {
    let newItems = { ...state.items };
    action.user.isFetching = false;
    newItems[action.user.ID] = action.user;
    return {
      items: newItems
    };
};

const createInvalidSaveUser = (state, action) => {
  if (action.user.ID !== -1) {
    let newItems = { ...state.items };
    let newItem = { ...newItems[action.user.ID] };
    newItem.isFetching = false;
    newItems[action.user.ID] = newItem;
    return {
      items: newItems
    };
  }
  return {};
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
        case REQUEST_SAVE_USER:
            return Object.assign({}, state, createRequestSaveUser(state, action));
        case RECEIVE_SAVED_USER:
            return Object.assign({}, state, createReceiveSavedUser(state, action));
        case INVALID_SAVE_USER:
            return Object.assign({}, state, createInvalidSaveUser(state, action));
        default:
            return state;
    }
};

export default usersReducer;

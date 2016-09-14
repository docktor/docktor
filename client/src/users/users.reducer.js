// import constants
import UsersConstants from './users.constants.js';

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
  if (action.user.id !== -1) {
    let newItem = { ...state.items[action.user.id] };
    newItem.isFetching = true;
    state.items[action.user.id] = newItem;
    return {
      items: state.items
    };
  }
  return {};
};

const createReceiveSavedUser = (state, action) => {
    action.user.isFetching = false;
    state.items[action.user.id] = action.user;
    return {
      items: state.items
    };
};

const createInvalidSaveUser = (state, action) => {
  if (action.user.id !== -1) {
    let newItem = { ...state.items[action.user.id] };
    newItem.isFetching = false;
    state.items[action.user.id] = newItem;
    return {
      items: state.items
    };
  }
  return {};
};

const createReceiveUsers = (action) => {
    let users = {};
    action.users.forEach(user => users[user.id] = user);
    return {
        isFetching: false,
        didInvalidate: false,
        items: users,
        lastUpdated: action.receivedAt
    };
};

const usersReducer = (state = initialState, action) => {
    switch (action.type) {
        case UsersConstants.INVALID_REQUEST_USERS:
            return Object.assign({}, initialState);
        case UsersConstants.REQUEST_ALL_USERS:
            return Object.assign({}, state, createRequestAllUsers());
        case UsersConstants.RECEIVE_USERS:
            return Object.assign({}, state, createReceiveUsers(action));
        case UsersConstants.REQUEST_SAVE_USER:
            return Object.assign({}, state, createRequestSaveUser(state, action));
        case UsersConstants.RECEIVE_SAVED_USER:
            return Object.assign({}, state, createReceiveSavedUser(state, action));
        case UsersConstants.INVALID_SAVE_USER:
            return Object.assign({}, state, createInvalidSaveUser(state, action));
        default:
            return state;
    }
};

export default usersReducer;

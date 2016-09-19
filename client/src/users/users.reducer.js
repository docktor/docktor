// import constants
import UsersConstants from './users.constants.js';
import { generateEntitiesReducer } from '../utils/entities.js';

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

const usersReducer = (state, action) => {
    const entitiesState = generateEntitiesReducer(state, action, 'users');
    switch (action.type) {
        case UsersConstants.REQUEST_SAVE_USER:
            return Object.assign({}, entitiesState, createRequestSaveUser(state, action));
        case UsersConstants.RECEIVE_SAVED_USER:
            return Object.assign({}, entitiesState, createReceiveSavedUser(state, action));
        case UsersConstants.INVALID_SAVE_USER:
            return Object.assign({}, entitiesState, createInvalidSaveUser(state, action));
        default:
            return entitiesState;
    }
};

export default usersReducer;

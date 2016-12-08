// import constants
import UsersConstants from './users.constants.js';
import { generateEntitiesReducer } from '../utils/entities.js';

const createRequestSaveUser  = (state, action) => {
  if (action.user.id !== -1) {
    let newItem = { ...state.items[action.user.id] };
    newItem.isFetching = true;
    newItem.errorMessage = '';
    state.items[action.user.id] = newItem;
    return {
      items: state.items
    };
  }
  return {};
};

const createReceiveSavedUser = (state, action) => {
  action.user.isFetching = false;
  action.user.errorMessage = '';
  state.items[action.user.id] = action.user;
  return {
    items: state.items
  };
};

const createInvalidSaveUser = (state, action) => {
  if (action.user.id !== -1) {
    let newItem = { ...state.items[action.user.id] };
    newItem.isFetching = false;
    newItem.errorMessage = action.error;
    state.items[action.user.id] = newItem;
    return {
      items: state.items
    };
  }
  return {};
};

const createRequestDeleteUser  = (state, action) => {
  if (action.user.id !== -1) {
    let newItem = { ...state.items[action.user.id] };
    newItem.isDeleting = true;
    newItem.errorMessage = '';
    state.items[action.user.id] = newItem;
    return {
      items: state.items
    };
  }
  return {};
};

const createReceiveDeletedUser = (state, action) => {
  let { [action.removedID] : omit,  ...newItems } = state.items;
  return {
    items: newItems
  };
};

const createInvalidDeleteUser = (state, action) => {
  if (action.user.id !== -1) {
    let newItem = { ...state.items[action.user.id] };
    newItem.isDeleting = false;
    newItem.errorMessage = action.error;
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
  case UsersConstants.REQUEST_DELETE_USER:
    return Object.assign({}, entitiesState, createRequestDeleteUser(state, action));
  case UsersConstants.RECEIVE_DELETED_USER:
    return Object.assign({}, entitiesState, createReceiveDeletedUser(state, action));
  case UsersConstants.INVALID_DELETE_USER:
    return Object.assign({}, entitiesState, createInvalidDeleteUser(state, action));
  case UsersConstants.CHANGE_FILTER:
    return { ...entitiesState, filterValue: action.filterValue };
  default:
    return entitiesState;
  }
};

export default usersReducer;

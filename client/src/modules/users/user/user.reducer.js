import UserConstants from './user.constants.js';

const initialState = {
  isFetching: false,
  didInvalidate: true,
  item: {}
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
  case UserConstants.INVALID_REQUEST_USER:
    return {
      ...state,
      isFetching: false,
      didInvalidate: true
    };
  case UserConstants.REQUEST_USER:
    return {
      ...state,
      isFetching: true,
      didInvalidate: false,
      item: {}
    };
  case UserConstants.RECEIVE_USER:
    return {
      ...state,
      isFetching: false,
      item: action.user
    };
  case UserConstants.REQUEST_UPDATE_USER:
    return {
      ...state,
      isFetching: true,
      didInvalidate: false
    };
  case UserConstants.USER_SAVED:
    return {
      ...state,
      isFetching: false,
      didInvalidate: false,
      item : action.user
    };
  default:
    return state;
  }
};

export default userReducer;

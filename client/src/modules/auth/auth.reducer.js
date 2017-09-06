import { combineReducers } from 'redux';

// import constants
import { AuthConstants } from './auth.actions';
import { UsersConstants } from '../users/users.actions';

const isFetching = (state = false, action) => {
  switch (action.type) {
    case AuthConstants.LOGIN_REQUEST:
    case AuthConstants.PROFILE_REQUEST:
    case AuthConstants.REGISTER_REQUEST:
    case AuthConstants.RESET_PASSWORD_REQUEST:
    case AuthConstants.CHANGE_PASSWORD_REQUEST:
    case UsersConstants.REQUEST_SAVE_USER:
      return true;
    case AuthConstants.LOGIN_SUCCESS:
    case AuthConstants.LOGIN_INVALID_REQUEST:
    case AuthConstants.LOGIN_NOT_AUTHORIZED:
    case AuthConstants.LOGIN_BAD_AUTH_TOKEN:
    case AuthConstants.LOGOUT_SUCCESS:
    case AuthConstants.PROFILE_SUCCESS:
    case AuthConstants.PROFILE_FAILURE:
    case AuthConstants.REGISTER_SUCCESS:
    case AuthConstants.REGISTER_INVALID_REQUEST:
    case AuthConstants.REGISTER_NOT_AUTHORIZED:
    case AuthConstants.RESET_PASSWORD_SUCCESS:
    case AuthConstants.RESET_PASSWORD_INVALID_REQUEST:
    case AuthConstants.RESET_PASSWORD_NOT_AUTHORIZED:
    case AuthConstants.CHANGE_PASSWORD_SUCCESS:
    case AuthConstants.CHANGE_PASSWORD_INVALID_REQUEST:
    case AuthConstants.CHANGE_PASSWORD_NOT_AUTHORIZED:
    case UsersConstants.USER_SAVED:
      return false;
    default:
      return state;
  }
};


const initialAuthenticated = localStorage.getItem('id_token') ? true : false;
const isAuthenticated = (state = initialAuthenticated, action) => {
  switch (action.type) {
    case AuthConstants.LOGIN_SUCCESS:
    case AuthConstants.PROFILE_SUCCESS:
    case AuthConstants.REGISTER_SUCCESS:
      return true;
    case AuthConstants.LOGIN_REQUEST:
    case AuthConstants.LOGIN_INVALID_REQUEST:
    case AuthConstants.LOGIN_NOT_AUTHORIZED:
    case AuthConstants.LOGIN_BAD_AUTH_TOKEN:
    case AuthConstants.LOGOUT_SUCCESS:
    case AuthConstants.PROFILE_REQUEST:
    case AuthConstants.PROFILE_FAILURE:
    case AuthConstants.REGISTER_REQUEST:
    case AuthConstants.REGISTER_INVALID_REQUEST:
    case AuthConstants.REGISTER_NOT_AUTHORIZED:
      return false;
    default:
      return state;
  }
};

const errorMessage = (state = '', action) => {
  switch (action.type) {
    case AuthConstants.LOGIN_SUCCESS:
    case AuthConstants.LOGOUT_SUCCESS:
    case AuthConstants.PROFILE_SUCCESS:
    case AuthConstants.REGISTER_SUCCESS:
    case AuthConstants.RESET_PASSWORD_SUCCESS:
    case AuthConstants.CHANGE_PASSWORD_SUCCESS:
    case AuthConstants.LOGIN_BAD_AUTH_TOKEN:
      return '';
    case AuthConstants.LOGIN_INVALID_REQUEST:
    case AuthConstants.LOGIN_NOT_AUTHORIZED:
    case AuthConstants.PROFILE_FAILURE:
    case AuthConstants.REGISTER_INVALID_REQUEST:
    case AuthConstants.REGISTER_NOT_AUTHORIZED:
    case AuthConstants.RESET_PASSWORD_INVALID_REQUEST:
    case AuthConstants.RESET_PASSWORD_NOT_AUTHORIZED:
    case AuthConstants.CHANGE_PASSWORD_INVALID_REQUEST:
    case AuthConstants.CHANGE_PASSWORD_NOT_AUTHORIZED:
      return action.message || action.error;
    default:
      return state;
  }
};

const user = (state = {}, action) => {
  switch (action.type) {
    case AuthConstants.LOGIN_REQUEST:
    case AuthConstants.LOGIN_INVALID_REQUEST:
    case AuthConstants.LOGIN_NOT_AUTHORIZED:
    case AuthConstants.LOGIN_BAD_AUTH_TOKEN:
    case AuthConstants.LOGOUT_SUCCESS:
    case AuthConstants.REGISTER_REQUEST:
    case AuthConstants.REGISTER_INVALID_REQUEST:
    case AuthConstants.REGISTER_NOT_AUTHORIZED:
    case AuthConstants.PROFILE_REQUEST:
    case AuthConstants.PROFILE_FAILURE:
      return {};
    case AuthConstants.LOGIN_SUCCESS:
    case AuthConstants.PROFILE_SUCCESS:
    case AuthConstants.REGISTER_SUCCESS:
      return action.user;
    case UsersConstants.USER_DELETED:
      return action.id === state.id ? {} : state;
    case UsersConstants.REQUEST_SAVE_USER:
      return action.entity.id === state.id ?
        { ...action.entity, isFetching: true, errorMessage: '' } : state;
    case UsersConstants.USER_SAVED:
      const response = action.response;
      return response.result === state.id ?
        { ...response.entities.all[response.result], isFetching: false, errorMessage: '' } : state;
    case UsersConstants.INVALID_SAVE_USER:
      return action.entity.id === state.id ?
        { ...action.entity, isFetching: false, errorMessage: action.error } : state;
    default:
      return state;
  }
};

// The auth reducer. The starting state sets authentication
// based on a token being in local storage. In a real app,
// we would also want a util to check if the token is expired.
const authReducer = combineReducers({
  isFetching,
  isAuthenticated,
  errorMessage,
  user,
});

export default authReducer;

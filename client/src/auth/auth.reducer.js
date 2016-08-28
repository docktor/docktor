import { combineReducers } from 'redux';
import {
  LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_INVALID_REQUEST, LOGIN_NOT_AUTHORIZED,
  LOGOUT_SUCCESS,
  PROFILE_REQUEST, PROFILE_SUCCESS, PROFILE_FAILURE,
  REGISTER_REQUEST, REGISTER_SUCCESS, REGISTER_INVALID_REQUEST, REGISTER_NOT_AUTHORIZED,
  SWITCH_FORM
} from './auth.actions.js';


const initialState = {
  isFetching: false,
  isAuthenticated: localStorage.getItem('id_token') ? true : false,
  user : {}
};

// The auth reducer. The starting state sets authentication
// based on a token being in local storage. In a real app,
// we would also want a util to check if the token is expired.
const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
        isAuthenticated: false,
        user : {}
      });
    case LOGIN_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        isAuthenticated: true,
        errorMessage: '',
        user : action.user
      });
    case LOGIN_INVALID_REQUEST:
      return Object.assign({}, state, {
        isFetching: false,
        isAuthenticated: false,
        user : {}
      });
    case LOGIN_NOT_AUTHORIZED:
      return Object.assign({}, state, {
        isFetching: false,
        isAuthenticated: false,
        errorMessage: action.error,
        user : {}
      });
    case LOGOUT_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        isAuthenticated: false,
        user : {}
      });
    case PROFILE_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case PROFILE_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        isAuthenticated: true,
        errorMessage: '',
        user : action.user
      });
    case PROFILE_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        isAuthenticated: false,
        errorMessage: action.message,
        user : {}
      });
    case REGISTER_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
        isAuthenticated: false,
        errorMessage : '',
        user : {}
      });
    case REGISTER_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        isAuthenticated: true,
        errorMessage : '',
        user : action.user
      });
    case REGISTER_INVALID_REQUEST:
      return Object.assign({}, state, {
        isFetching: false,
        isAuthenticated: false,
        errorMessage : action.error,
        user : {}
      });
    case REGISTER_NOT_AUTHORIZED:
      return Object.assign({}, state, {
        isFetching: false,
        isAuthenticated: false,
        errorMessage : action.error,
        user : {}
      });
    case SWITCH_FORM:
      return Object.assign({}, state, {
        errorMessage: ''
      });
    default:
      return state;
  }
};

export default authReducer;

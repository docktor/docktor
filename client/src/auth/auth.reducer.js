// import constants
import AuthConstants from './auth.constants.js';
import UsersConstants from '../users/users.constants.js';


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
    case AuthConstants.LOGIN_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
        isAuthenticated: false,
        user : {}
      });
    case AuthConstants.LOGIN_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        isAuthenticated: true,
        errorMessage: '',
        user : action.user
      });
    case AuthConstants.LOGIN_INVALID_REQUEST:
      return Object.assign({}, state, {
        isFetching: false,
        isAuthenticated: false,
        user : {}
      });
    case AuthConstants.LOGIN_NOT_AUTHORIZED:
      return Object.assign({}, state, {
        isFetching: false,
        isAuthenticated: false,
        errorMessage: action.error,
        user : {}
      });
    case AuthConstants.LOGOUT_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        isAuthenticated: false,
        user : {}
      });
    case AuthConstants.PROFILE_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case AuthConstants.PROFILE_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        isAuthenticated: true,
        errorMessage: '',
        user : action.user
      });
    case AuthConstants.PROFILE_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        isAuthenticated: false,
        errorMessage: action.message,
        user : {}
      });
    case AuthConstants.REGISTER_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
        isAuthenticated: false,
        errorMessage : '',
        user : {}
      });
    case AuthConstants.REGISTER_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        isAuthenticated: true,
        errorMessage : '',
        user : action.user
      });
    case AuthConstants.REGISTER_INVALID_REQUEST:
      return Object.assign({}, state, {
        isFetching: false,
        isAuthenticated: false,
        errorMessage : action.error,
        user : {}
      });
    case AuthConstants.REGISTER_NOT_AUTHORIZED:
      return Object.assign({}, state, {
        isFetching: false,
        isAuthenticated: false,
        errorMessage : action.error,
        user : {}
      });
    case AuthConstants.SWITCH_FORM:
      return Object.assign({}, state, {
        errorMessage: ''
      });
    case UsersConstants.REQUEST_SAVE_USER:
      return Object.assign({}, state, authenticatedUserIsFetching(state, action));
    case UsersConstants.RECEIVE_SAVED_USER:
      return Object.assign({}, state, changeUserIfNeeded(state, action));
    default:
      return state;
  }
};

const authenticatedUserIsFetching = (state, action) => {
    if (action.user.username === state.user.username) {
      return {
          user: Object.assign({}, action.user, { isFetching: true })
      };
    } else {
      return {};
    }
};

const changeUserIfNeeded = (state, action) => {
    if (action.user.id === state.user.id) {
      return {
          user: Object.assign({}, action.user, { isFetching: false })
      };
    } else {
      return {};
    }
};

export default authReducer;

// import constants
import AuthConstants from './auth.constants';
import UsersConstants from '../users/users.constants';
import { LOCATION_CHANGE } from 'react-router-redux';


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
  case LOCATION_CHANGE:
    return { ...state, errorMessage: '' };
  case AuthConstants.LOGIN_REQUEST:
    return {
      ...state,
      isFetching: true,
      isAuthenticated: false,
      user : {}
    };
  case AuthConstants.LOGIN_SUCCESS:
    return {
      ...state,
      isFetching: false,
      isAuthenticated: true,
      errorMessage: '',
      user : action.user
    };
  case AuthConstants.LOGIN_INVALID_REQUEST:
    return {
      ...state,
      isFetching: false,
      isAuthenticated: false,
      user : {}
    };
  case AuthConstants.LOGIN_NOT_AUTHORIZED:
    return {
      ...state,
      isFetching: false,
      isAuthenticated: false,
      errorMessage: action.error,
      user : {}
    };
  case AuthConstants.LOGOUT_SUCCESS:
    return {
      ...state,
      isFetching: false,
      isAuthenticated: false,
      user : {}
    };
  case AuthConstants.PROFILE_REQUEST:
    return {
      ...state,
      isFetching: true,
    };
  case AuthConstants.PROFILE_SUCCESS:
    return {
      ...state,
      isFetching: false,
      isAuthenticated: true,
      errorMessage: '',
      user : action.user
    };
  case AuthConstants.PROFILE_FAILURE:
    return {
      ...state,
      isFetching: false,
      isAuthenticated: false,
      errorMessage: action.message,
      user : {}
    };
  case AuthConstants.REGISTER_REQUEST:
    return {
      ...state,
      isFetching: true,
      isAuthenticated: false,
      errorMessage : '',
      user : {}
    };
  case AuthConstants.REGISTER_SUCCESS:
    return {
      ...state,
      isFetching: false,
      isAuthenticated: true,
      errorMessage : '',
      user : action.user
    };
  case AuthConstants.REGISTER_INVALID_REQUEST:
    return {
      ...state,
      isFetching: false,
      isAuthenticated: false,
      errorMessage : action.error,
      user : {}
    };
  case AuthConstants.REGISTER_NOT_AUTHORIZED:
    return {
      ...state,
      isFetching: false,
      isAuthenticated: false,
      errorMessage : action.error,
      user : {}
    };
  case AuthConstants.SWITCH_FORM:
    return {
      ...state,
      errorMessage: ''
    };
  case AuthConstants.RESET_PASSWORD_REQUEST:
    return {
      ...state,
      isFetching: true
    };
  case AuthConstants.RESET_PASSWORD_SUCCESS:
    return {
      ...state,
      isFetching: false,
      errorMessage: ''
    };
  case AuthConstants.RESET_PASSWORD_INVALID_REQUEST:
    return {
      ...state,
      isFetching: false
    };
  case AuthConstants.RESET_PASSWORD_NOT_AUTHORIZED:
    return {
      ...state,
      isFetching: false,
      errorMessage: action.error
    };
  case AuthConstants.CHANGE_PASSWORD_REQUEST:
    return {
      ...state,
      user : { ...state.user, isFetching: true, passwordErrorMessage: '' }
    };
  case AuthConstants.CHANGE_PASSWORD_SUCCESS:
    return {
      ...state,
      user : { ...state.user, isFetching: false, passwordErrorMessage: '' },
      errorMessage: ''
    };
  case AuthConstants.CHANGE_PASSWORD_INVALID_REQUEST:
    return {
      ...state,
      user : { ...state.user, isFetching: false, passwordErrorMessage: action.error }
    };
  case AuthConstants.CHANGE_PASSWORD_NOT_AUTHORIZED:
    return {
      ...state,
      user : { ...state.user, isFetching: false, passwordErrorMessage: action.error },
    };
  case UsersConstants.REQUEST_SAVE_USER:
    return { ...state, ...authenticatedUserIsFetching(state, action) };
  case UsersConstants.USER_SAVED:
    return { ...state, ...changeUserIfNeeded(state, action) };
  case UsersConstants.INVALID_SAVE_USER:
    return { ...state, ...authenticatedUserFetchingError(state, action) };
  case UsersConstants.REQUEST_DELETE_USER:
    if (action.id === state.user.id) {
      return {
        ...state,
        user : { ...state.user, isDeleting: true },
      };
    } else {
      return state;
    }
  case UsersConstants.USER_DELETED:
    if (action.removedID === state.user.id) {
      return {
        isAuthenticated : false,
        user: {},
        isFetching: false
      };
    } else {
      return state;
    }
  case UsersConstants.INVALID_DELETE_USER:
    if (action.user.id === state.user.id) {
      return {
        ...state,
        user : { ...state.user, isDeleting: false },
      };
    } else {
      return state;
    }
  default:
    return state;
  }
};

const authenticatedUserIsFetching = (state, action) => {
  if (action.user.id === state.user.id) {
    return {
      user: { ...action.user, isFetching: true, errorMessage: '' }
    };
  } else {
    return {};
  }
};

const authenticatedUserFetchingError = (state, action) => {
  if (action.user.id === state.user.id) {
    return {
      user: { ...action.user, isFetching: false, errorMessage: action.error }
    };
  } else {
    return {};
  }
};

const changeUserIfNeeded = (state, action) => {
  if (action.user.id === state.user.id) {
    return {
      user: { ...action.user, isFetching: false, errorMessage: '' }
    };
  } else {
    return {};
  }
};

export default authReducer;

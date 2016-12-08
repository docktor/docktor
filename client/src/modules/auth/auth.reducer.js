// import constants
import AuthConstants from './auth.constants.js';
import UsersConstants from '../users/users.constants.js';
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
    return Object.assign({}, state, { errorMessage: '' });
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
  case AuthConstants.RESET_PASSWORD_REQUEST:
    return Object.assign({}, state, {
      isFetching: true
    });
  case AuthConstants.RESET_PASSWORD_SUCCESS:
    return Object.assign({}, state, {
      isFetching: false,
      errorMessage: ''
    });
  case AuthConstants.RESET_PASSWORD_INVALID_REQUEST:
    return Object.assign({}, state, {
      isFetching: false
    });
  case AuthConstants.RESET_PASSWORD_NOT_AUTHORIZED:
    return Object.assign({}, state, {
      isFetching: false,
      errorMessage: action.error
    });
  case AuthConstants.CHANGE_PASSWORD_REQUEST:
    return Object.assign({}, state, {
      user : Object.assign({}, state.user, { isFetching: true, passwordErrorMessage: '' })
    });
  case AuthConstants.CHANGE_PASSWORD_SUCCESS:
    return Object.assign({}, state, {
      user : Object.assign({}, state.user, { isFetching: false, passwordErrorMessage: '' }),
      errorMessage: ''
    });
  case AuthConstants.CHANGE_PASSWORD_INVALID_REQUEST:
    return Object.assign({}, state, {
      user : Object.assign({}, state.user, { isFetching: false, passwordErrorMessage: action.error })
    });
  case AuthConstants.CHANGE_PASSWORD_NOT_AUTHORIZED:
    return Object.assign({}, state, {
      user : Object.assign({}, state.user, { isFetching: false, passwordErrorMessage: action.error }),
    });
  case UsersConstants.REQUEST_SAVE_USER:
    return Object.assign({}, state, authenticatedUserIsFetching(state, action));
  case UsersConstants.RECEIVE_SAVED_USER:
    return Object.assign({}, state, changeUserIfNeeded(state, action));
  case UsersConstants.INVALID_SAVE_USER:
    return Object.assign({}, state, authenticatedUserFetchingError(state, action));
  case UsersConstants.REQUEST_DELETE_USER:
    if (action.user.id === state.user.id) {
      return Object.assign({}, state, {
        user : Object.assign({}, state.user, { isDeleting: true }),
      });
    } else {
      return state;
    }
  case UsersConstants.RECEIVE_DELETED_USER:
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
      return Object.assign({}, state, {
        user : Object.assign({}, state.user, { isDeleting: false }),
      });
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
      user: Object.assign({}, action.user, { isFetching: true, errorMessage: '' })
    };
  } else {
    return {};
  }
};

const authenticatedUserFetchingError = (state, action) => {
  if (action.user.id === state.user.id) {
    return {
      user: Object.assign({}, action.user, { isFetching: false, errorMessage: action.error })
    };
  } else {
    return {};
  }
};

const changeUserIfNeeded = (state, action) => {
  if (action.user.id === state.user.id) {
    return {
      user: Object.assign({}, action.user, { isFetching: false, errorMessage: '' })
    };
  } else {
    return {};
  }
};

export default authReducer;

// import constants
import UsersConstants from './users.constants';
import { generateEntitiesReducer } from '../utils/entities';

const usersReducer = (state, action) => {
  const entitiesState = generateEntitiesReducer(state, action, 'users');
  switch (action.type) {
  case UsersConstants.CHANGE_FILTER:
    return { ...entitiesState, filterValue: action.filterValue };
  case UsersConstants.INVALID_REQUEST_USER:
    return {
      ...entitiesState,
      selected : {
        ...entitiesState.selected,
        isFetching: false,
        didInvalidate: true,
        isDeleting: false,
        errorMessage: action.error,
        id: ''
      }
    };
  case UsersConstants.REQUEST_USER:
    return {
      ...entitiesState,
      selected : {
        ...entitiesState.selected,
        isFetching: true,
        didInvalidate: false,
        isDeleting: false,
        id: action.id,
        errorMessage: ''
      }
    };
  case UsersConstants.RECEIVE_USER:
    const newReceivedUser = action.user;
    const oldUserReceived = entitiesState.items[newReceivedUser.id];
    return {
      ...entitiesState,
      items: {
        ...entitiesState.items,
        [newReceivedUser.id]: { ...oldUserReceived, ...newReceivedUser }
      },
      selected: {
        ...entitiesState.selected,
        isFetching: false,
        isDeleting: false,
        id: action.user.id,
        errorMessage: ''
      }
    };
  case UsersConstants.REQUEST_SAVE_USER:
    return {
      ...entitiesState,
      selected: {
        ...entitiesState.selected,
        isFetching: true,
        didInvalidate: false,
        isDeleting: false,
        errorMessage: ''
      }
    };
  case UsersConstants.USER_SAVED:
    const newSavedUser = action.user;
    const oldUserSaved = entitiesState.items[newSavedUser.id];
    let newUserState = {
      ...entitiesState,
      items: {
        ...entitiesState.items,
        [newSavedUser.id]: { ...oldUserSaved, ...newSavedUser }
      },
      selected : {
        ...entitiesState.selected,
        isFetching: false,
        didInvalidate: false,
        isDeleting: false,
        id: '',
        errorMessage: ''
      }
    };
    return newUserState;
  case UsersConstants.REQUEST_DELETE_USER:
    return {
      ...entitiesState,
      selected: {
        ...entitiesState.selected,
        isFetching: false,
        didInvalidate: false,
        isDeleting: true
      }
    };
  case UsersConstants.USER_DELETED:
    let deletedUserState = {
      ...entitiesState,
      items: { ...entitiesState.items },
      selected : {
        isFetching: false,
        didInvalidate: true,
        isDeleting: false,
        id : '',
        errorMessage: ''
      }
    };
    delete deletedUserState.items[action.id];
    return deletedUserState;
  default:
    return entitiesState;
  }
};

export default usersReducer;

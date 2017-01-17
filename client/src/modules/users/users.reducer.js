// import constants
import UsersConstants from './users.constants';
import { generateEntitiesReducer } from '../utils/entities';

const usersReducer = (state, action) => {
  const entitiesState = generateEntitiesReducer(state, action, 'users');
  switch (action.type) {
  case UsersConstants.CHANGE_FILTER:
    return { ...entitiesState, filterValue: action.filterValue };
  default:
    return entitiesState;
  }
};

export default usersReducer;

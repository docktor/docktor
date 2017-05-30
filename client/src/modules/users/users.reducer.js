// import constants
import { generateEntitiesReducer } from '../utils/entities';

const usersReducer = (state, action) => {
  const reducer = generateEntitiesReducer('users');
  const entitiesState = reducer(state, action);
  switch (action.type) {
    default:
      return entitiesState;
  }
};

export default usersReducer;

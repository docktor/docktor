// import constants
import { generateEntitiesReducer } from '../utils/entities';

const groupsReducer = (state, action) => {
  const reducer = generateEntitiesReducer('groups');
  const entitiesState = reducer(state, action);
  switch (action.type) {
    default:
      return entitiesState;
  }
};

export default groupsReducer;

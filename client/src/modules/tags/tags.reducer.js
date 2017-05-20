// import constants
import { generateEntitiesReducer } from '../utils/entities';

const tagsReducer = (state, action) => {
  const reducer = generateEntitiesReducer('tags');
  const entitiesState = reducer(state, action);
  switch (action.type) {
    default:
      return entitiesState;
  }
};

export default tagsReducer;

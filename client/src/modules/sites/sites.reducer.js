import { generateEntitiesReducer } from '../utils/entities';

const sitesReducer = (state, action) => {
  const reducer = generateEntitiesReducer('sites');
  const entitiesState = reducer(state, action);
  switch (action.type) {
    default:
      return entitiesState;
  }
};

export default sitesReducer;

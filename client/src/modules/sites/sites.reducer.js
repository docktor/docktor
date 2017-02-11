import { generateEntitiesReducer } from '../utils/entities';

const sitesReducer = (state, action) => {
  const entitiesState = generateEntitiesReducer(state, action, 'sites');
  switch (action.type) {
  default:
    return entitiesState;
  }
};

export default sitesReducer;

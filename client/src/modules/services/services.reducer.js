// import constants
import { generateEntitiesReducer } from '../utils/entities';

const servicesReducer = (state, action) => {
  const reducer = generateEntitiesReducer('services');
  const entitiesState = reducer(state, action);
  switch (action.type) {
    default:
      return entitiesState;
  }
};

export default servicesReducer;

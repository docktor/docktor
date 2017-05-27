// import constants
import { DaemonsConstants } from './daemons.actions';
import { generateEntitiesReducer } from '../utils/entities';

const daemonInfoReducer = (items = {}, action) => {
  switch (action.type) {
    case DaemonsConstants.REQUEST_DAEMON_INFO: {
      const { [action.daemon.id]: item, ...restItems } = items;
      return { [action.daemon.id]: { ...item, isFetching: true }, ...restItems };
    }
    case DaemonsConstants.RECEIVE_DAEMON_INFO: {
      const { [action.daemon.id]: item, ...restItems } = items;
      return { [action.daemon.id]: { ...item, isFetching: false, info: action.info }, ...restItems };
    }
    case DaemonsConstants.INVALID_REQUEST_DAEMON_INFO: {
      const { [action.daemon.id]: item, ...restItems } = items;
      return { [action.daemon.id]: { ...item, isFetching: false, info: { status: 'DOWN' } }, ...restItems };
    }
    default:
      return items;
  }
};

const daemonsReducer = (state, action) => {
  const reducer = generateEntitiesReducer('daemons');
  const entitiesState = reducer(state, action);
  return { ...entitiesState, items: daemonInfoReducer(entitiesState.items, action) };
};

export default daemonsReducer;

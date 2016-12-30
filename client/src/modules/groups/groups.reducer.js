// import constants
import GroupsConstants from './groups.constants.js';
import { generateEntitiesReducer } from '../utils/entities.js';

const groupsReducer = (state, action) => {
  const entitiesState = generateEntitiesReducer(state, action, 'groups');
  switch (action.type) {
  case GroupsConstants.CHANGE_FILTER:
    return { ...entitiesState, filterValue: action.filterValue };
  case GroupsConstants.INVALID_REQUEST_GROUP:
    return {
      ...entitiesState,
      selected : {
        ...entitiesState.selected,
        isFetching: false,
        didInvalidate: true,
        id: ''
      }
    };
  case GroupsConstants.REQUEST_GROUP:
    return {
      ...entitiesState,
      selected : {
        ...entitiesState.selected,
        isFetching: true,
        didInvalidate: false,
        id: action.id
      }
    };
  case GroupsConstants.RECEIVE_GROUP:
    const newReceivedGroup = action.group;
    const oldGroupReceived = entitiesState.items[newReceivedGroup.id];
    return {
      ...entitiesState,
      items: {
        ...entitiesState.items,
        [newReceivedGroup.id]: { ...oldGroupReceived, ...newReceivedGroup }
      },
      selected: {
        ...entitiesState.selected,
        isFetching: false
      }
    };
  case GroupsConstants.REQUEST_SAVE_GROUP:
    return {
      ...entitiesState,
      selected: {
        ...entitiesState.selected,
        isFetching: true,
        didInvalidate: false
      }
    };
  case GroupsConstants.GROUP_SAVED:
    const newSavedGroup = action.group;
    const oldGroupSaved = entitiesState.items[newSavedGroup.id];
    let newGroupState = {
      ...entitiesState,
      items: {
        ...entitiesState.items,
        [newSavedGroup.id]: { ...oldGroupSaved, ...newSavedGroup }
      },
      selected : {
        ...entitiesState.selected,
        isFetching: false,
        didInvalidate: false,
        id: ''
      }
    };
    return newGroupState;
  case GroupsConstants.GROUP_DELETED:
    let deletedGroupState = {
      ...entitiesState,
      items: { ...entitiesState.items },
      selected : {
        isFetching: false,
        didInvalidate: true,
        id : ''
      }
    };
    delete deletedGroupState.items[action.id];
    return deletedGroupState;
  default:
    return entitiesState;
  }
};

export default groupsReducer;

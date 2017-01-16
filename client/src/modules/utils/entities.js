import { push, goBack } from 'react-router-redux';
import { withAuth } from '../auth/auth.wrappers';
import { checkHttpStatus, parseJSON, handleError } from '../utils/promises';

const getConsts = (entitiesName) => {
  const ENTITIES_NAME = entitiesName.toUpperCase();
  const ENTITY_NAME = ENTITIES_NAME.slice(0, -1);
  const CONST_REQUEST = 'REQUEST_' + ENTITIES_NAME;
  const CONST_RECEIVE = 'RECEIVE_' + ENTITIES_NAME;
  const CONST_INVALID = 'INVALID_REQUEST_' + ENTITIES_NAME;
  const CONST_REQUEST_ENTITY = 'REQUEST_' + ENTITY_NAME;
  const CONST_RECEIVE_ENTITY = 'RECEIVE_' + ENTITY_NAME;
  const CONST_INVALID_ENTITY = 'INVALID_REQUEST_' + ENTITY_NAME;
  const CONST_SAVE_ENTITY = 'REQUEST_SAVE_' + ENTITY_NAME;
  const CONST_ENTITY_SAVED = ENTITY_NAME + '_SAVED';
  const CONST_INVALID_SAVE_ENTITY = 'INVALID_SAVE_' + ENTITY_NAME;
  const CONST_DELETE_ENTITY = 'REQUEST_DELETE_' + ENTITY_NAME;
  const CONST_ENTITY_DELETED = ENTITY_NAME + '_DELETED';
  const CONST_INVALID_DELETE_ENTITY = 'INVALID_DELETE_' + ENTITY_NAME;
  return {
    CONST_REQUEST,
    CONST_RECEIVE,
    CONST_INVALID,
    CONST_REQUEST_ENTITY,
    CONST_RECEIVE_ENTITY,
    CONST_INVALID_ENTITY,
    CONST_SAVE_ENTITY,
    CONST_ENTITY_SAVED,
    CONST_INVALID_SAVE_ENTITY,
    CONST_DELETE_ENTITY,
    CONST_ENTITY_DELETED,
    CONST_INVALID_DELETE_ENTITY
  };
};

export const generateEntitiesConstants = (entitiesName) => {
  const {
    CONST_REQUEST, CONST_RECEIVE, CONST_INVALID,
    CONST_REQUEST_ENTITY, CONST_RECEIVE_ENTITY, CONST_INVALID_ENTITY,
    CONST_SAVE_ENTITY, CONST_ENTITY_SAVED, CONST_INVALID_SAVE_ENTITY,
    CONST_DELETE_ENTITY, CONST_ENTITY_DELETED, CONST_INVALID_DELETE_ENTITY
  } = getConsts(entitiesName);
  const constants = {};
  constants[CONST_REQUEST] = CONST_REQUEST;
  constants[CONST_RECEIVE] = CONST_RECEIVE;
  constants[CONST_INVALID] = CONST_INVALID;
  constants[CONST_REQUEST_ENTITY] = CONST_REQUEST_ENTITY;
  constants[CONST_RECEIVE_ENTITY] = CONST_RECEIVE_ENTITY;
  constants[CONST_INVALID_ENTITY] = CONST_INVALID_ENTITY;
  constants[CONST_SAVE_ENTITY] = CONST_SAVE_ENTITY;
  constants[CONST_ENTITY_SAVED] = CONST_ENTITY_SAVED;
  constants[CONST_INVALID_SAVE_ENTITY] = CONST_INVALID_SAVE_ENTITY;
  constants[CONST_DELETE_ENTITY] = CONST_DELETE_ENTITY;
  constants[CONST_ENTITY_DELETED] = CONST_ENTITY_DELETED;
  constants[CONST_INVALID_DELETE_ENTITY] = CONST_INVALID_DELETE_ENTITY;
  return constants;
};

export const generateEntitiesActions = (entitiesName) => {
  const {
    CONST_REQUEST, CONST_RECEIVE, CONST_INVALID,
    CONST_REQUEST_ENTITY, CONST_RECEIVE_ENTITY, CONST_INVALID_ENTITY,
    CONST_SAVE_ENTITY, CONST_ENTITY_SAVED, CONST_INVALID_SAVE_ENTITY,
    CONST_DELETE_ENTITY, CONST_ENTITY_DELETED, CONST_INVALID_DELETE_ENTITY
  } = getConsts(entitiesName);
  return {
    requestAll: () => {
      return { type: CONST_REQUEST };
    },
    receiveSome: (items) => {
      return {
        type: CONST_RECEIVE,
        items,
        receivedAt: Date.now()
      };
    },
    invalidRequest: (error) => {
      return {
        type: CONST_INVALID,
        title: `Error on ${entitiesName.toLowerCase()} API`,
        message: error,
        level: 'error'
      };
    },
    requestOne: (id) => {
      return {
        type: CONST_REQUEST_ENTITY,
        id
      };
    },
    receiveOne: (entity) => {
      return {
        type: CONST_RECEIVE_ENTITY,
        entity
      };
    },
    invalidRequestEntity: (entity) => (error) => {
      const entityName = entitiesName.toLowerCase().slice(0, -1);
      const title = entity.title || entity.name || entity.username;
      return {
        type: CONST_INVALID_ENTITY,
        title: `Cannot fetch ${entityName} ${title}`,
        message: error,
        level: 'error'
      };
    },
    requestSave: (entity) => {
      return {
        type: CONST_SAVE_ENTITY,
        entity
      };
    },
    saved: (entity) => {
      return {
        type: CONST_ENTITY_SAVED,
        entity
      };
    },
    invalidSaveEntity: (entity) => (error) => {
      const entityName = entitiesName.toLowerCase().slice(0, -1);
      const title = entity.title || entity.name || entity.username;
      return {
        type: CONST_INVALID_SAVE_ENTITY,
        title: `Cannot save ${entityName} ${title}`,
        message: error,
        level: 'error'
      };
    },
    requestDelete: (id) => {
      return {
        type: CONST_DELETE_ENTITY,
        id
      };
    },
    deleted: (id) => {
      return {
        type: CONST_ENTITY_DELETED,
        id,
        receivedAt: Date.now()
      };
    },
    invalidDeleteEntity: (entity) => (error) => {
      const entityName = entitiesName.toLowerCase().slice(0, -1);
      const title = entity.title || entity.name || entity.username;
      return {
        type: CONST_INVALID_DELETE_ENTITY,
        title: `Cannot delete ${entityName} ${title}`,
        message: error,
        level: 'error'
      };
    }
  };
};

const initialState = {
  isFetching: false,
  didInvalidate: true,
  items: {},
  selected: {
    isFetching: false,
    didInvalidate: true,
    id: ''
  },
  lastUpdated: undefined
};

export const generateEntitiesReducer = (state = initialState, action, entitiesName) => {
  const {
    CONST_REQUEST, CONST_RECEIVE, CONST_INVALID,
    CONST_REQUEST_ENTITY, CONST_RECEIVE_ENTITY,
    CONST_SAVE_ENTITY, CONST_ENTITY_SAVED,
    CONST_DELETE_ENTITY, CONST_ENTITY_DELETED,
    CONST_INVALID_ENTITY
  } = getConsts(entitiesName);
  switch (action.type) {
  case CONST_INVALID:
    return {
      ...state,
      ...initialState
    };
  case CONST_REQUEST:
    return {
      ...state,
      isFetching: true,
      didInvalidate: false
    };
  case CONST_RECEIVE:
    let items = {};
    action.items.forEach(item => items[item.id] = { ...state.items[item.id], ...item });
    return {
      ...state,
      isFetching: false,
      didInvalidate: false,
      items,
      lastUpdated: action.receivedAt
    };
  case CONST_REQUEST_ENTITY:
    return {
      ...state,
      selected : {
        ...state.selected,
        isFetching: true,
        didInvalidate: false,
        id: action.id
      }
    };
  case CONST_RECEIVE_ENTITY:
    const newReceivedEntity = action.entity;
    const oldEntityReceived = state.items[newReceivedEntity.id];
    return {
      ...state,
      items: {
        ...state.items,
        [newReceivedEntity.id]: { ...oldEntityReceived, ...newReceivedEntity }
      },
      selected: {
        ...state.selected,
        isFetching: false
      }
    };
  case CONST_SAVE_ENTITY:
  case CONST_DELETE_ENTITY:
    return {
      ...state,
      selected: {
        ...state.selected,
        isFetching: true,
        didInvalidate: false
      }
    };
  case CONST_ENTITY_SAVED:
    const newSavedEntity = action.entity;
    const oldEntitySaved = state.items[newSavedEntity.id];
    let newEntityState = {
      ...state,
      items: {
        ...state.items,
        [newSavedEntity.id]: { ...oldEntitySaved, ...newSavedEntity }
      },
      selected : {
        ...state.selected,
        isFetching: false,
        didInvalidate: false,
        id: ''
      }
    };
    return newEntityState;
  case CONST_ENTITY_DELETED:
    let deletedEntityState = {
      ...state,
      items: { ...state.items },
      selected : {
        isFetching: false,
        didInvalidate: true,
        id : ''
      }
    };
    delete deletedEntityState.items[action.id];
    return deletedEntityState;
  case CONST_INVALID_ENTITY:
    return {
      ...state,
      selected : {
        ...state.selected,
        isFetching: false,
        didInvalidate: true,
        id: ''
      }
    };
  default:
    return state;
  }
};

// Check that if entities should be fetched
const shouldFetch = (state, entitiesName) => {
  const entities = state[entitiesName.toLowerCase()];
  if (!entities || entities.didInvalidate) {
    return true;
  } else if (entities.isFetching) {
    return false;
  } else {
    return true;
  }
};

// Thunk to fech only if needed
const fetchIfNeeded = (entitiesName, fetchFunc) => {
  return (dispatch, getState) => {
    if (shouldFetch(getState(), entitiesName)) {
      return dispatch(fetchFunc());
    } else {
      return Promise.resolve();
    }
  };
};

export const generateEntitiesThunks = (entitiesName) => {
  const Actions = generateEntitiesActions(entitiesName);
  const fetchAllFunc = () => {
    return (dispatch) => {
      dispatch(Actions.requestAll());
      return fetch(`/api/${entitiesName}`, withAuth({ method:'GET' }))
        .then(checkHttpStatus)
        .then(parseJSON)
        .then(response => {
          dispatch(Actions.receiveSome(response));
        })
        .catch(error => {
          handleError(error, Actions.invalidRequest, dispatch);
        });
    };
  };
  const fetchFunc = (id) => {
    return function (dispatch) {
      dispatch(Actions.requestOne(id));
      return fetch(`/api/${entitiesName}/${id}`, withAuth({ method:'GET' }))
        .then(checkHttpStatus)
        .then(parseJSON)
        .then(response => {
          dispatch(Actions.receiveOne(response));
        })
        .catch(error => {
          handleError(error, Actions.invalidRequestEntity, dispatch);
        });
    };
  };
  const saveFunc = (form) => {
    let entity = { ...form };
    entity.created = entity.created ? new Date(entity.created) : new Date();
    const endpoint = entity.id || 'new';
    const method = entity.id ? 'PUT' : 'POST';
    return function (dispatch) {
      dispatch(Actions.requestSave(entity));
      let request = new Request(`/api/${entitiesName}/${endpoint}`, withAuth({
        method: method,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entity)
      }));

      return fetch(request)
        .then(checkHttpStatus)
        .then(parseJSON)
        .then(response => {
          dispatch(Actions.saved(response));
          dispatch(goBack());
        })
        .catch(error => {
          handleError(error, Actions.invalidSaveEntity(entity), dispatch);
        });
    };
  };
  const deleteFunc = (id) => {
    return function (dispatch) {
      dispatch(Actions.requestDelete(id));
      let request = new Request(`/api/${entitiesName}/${id}`, withAuth({
        method: 'DELETE'
      }));
      return fetch(request)
        .then(checkHttpStatus)
        .then(parseJSON)
        .then(response => {
          dispatch(Actions.deleted(response));
          dispatch(push(`/${entitiesName}`));
        })
        .catch(error => {
          handleError(error, Actions.invalidDeleteEntity(entity), dispatch);
        });
    };
  };
  return {
    fetchAll: fetchAllFunc,
    fetchIfNeeded: () => fetchIfNeeded(entitiesName, fetchAllFunc),
    fetch: fetchFunc,
    save: saveFunc,
    delete: deleteFunc
  };
};

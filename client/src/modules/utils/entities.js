import { normalize, schema } from 'normalizr';
import { combineReducers } from 'redux';
import { LOCATION_CHANGE } from 'react-router-redux';
import { withAuth } from '../auth/auth.wrappers';
import { checkHttpStatus, handleError, parseJSON, parseText } from '../utils/promises';

export const entitySchema = new schema.Entity('all');
export const entitiesSchema = new schema.Array(entitySchema);

const getConsts = (entitiesName) => {
  const ENTITIES_NAME = entitiesName.toUpperCase();
  const ENTITY_NAME = ENTITIES_NAME.slice(0, -1);
  return {
    CONST_REQUEST: 'REQUEST_' + ENTITIES_NAME,
    CONST_RECEIVE: 'RECEIVE_' + ENTITIES_NAME,
    CONST_INVALID: 'INVALID_REQUEST_' + ENTITIES_NAME,
    CONST_REQUEST_ENTITY: 'REQUEST_' + ENTITY_NAME,
    CONST_RECEIVE_ENTITY: 'RECEIVE_' + ENTITY_NAME,
    CONST_INVALID_ENTITY: 'INVALID_REQUEST_' + ENTITY_NAME,
    CONST_SAVE_ENTITY: 'REQUEST_SAVE_' + ENTITY_NAME,
    CONST_ENTITY_SAVED: ENTITY_NAME + '_SAVED',
    CONST_INVALID_SAVE_ENTITY: 'INVALID_SAVE_' + ENTITY_NAME,
    CONST_DELETE_ENTITY: 'REQUEST_DELETE_' + ENTITY_NAME,
    CONST_ENTITY_DELETED: ENTITY_NAME + '_DELETED',
    CONST_INVALID_DELETE_ENTITY: 'INVALID_DELETE_' + ENTITY_NAME,
    CHANGE_FILTER: 'CHANGE_FILTER_' + ENTITIES_NAME,
  };
};

export const generateEntitiesConstants = (entitiesName) => {
  const csts = getConsts(entitiesName);
  return {
    [csts.CONST_REQUEST]: csts.CONST_REQUEST,
    [csts.CONST_RECEIVE]: csts.CONST_RECEIVE,
    [csts.CONST_INVALID]: csts.CONST_INVALID,
    [csts.CONST_REQUEST_ENTITY]: csts.CONST_REQUEST_ENTITY,
    [csts.CONST_RECEIVE_ENTITY]: csts.CONST_RECEIVE_ENTITY,
    [csts.CONST_INVALID_ENTITY]: csts.CONST_INVALID_ENTITY,
    [csts.CONST_SAVE_ENTITY]: csts.CONST_SAVE_ENTITY,
    [csts.CONST_ENTITY_SAVED]: csts.CONST_ENTITY_SAVED,
    [csts.CONST_INVALID_SAVE_ENTITY]: csts.CONST_INVALID_SAVE_ENTITY,
    [csts.CONST_DELETE_ENTITY]: csts.CONST_DELETE_ENTITY,
    [csts.CONST_ENTITY_DELETED]: csts.CONST_ENTITY_DELETED,
    [csts.CONST_INVALID_DELETE_ENTITY]: csts.CONST_INVALID_DELETE_ENTITY,
    [csts.CHANGE_FILTER]: csts.CHANGE_FILTER,
  };
};

export const generateEntitiesActions = (entitiesName) => {
  const csts = getConsts(entitiesName);
  return {
    requestAll: () => {
      return { type: csts.CONST_REQUEST };
    },
    receiveSome: (response) => {
      return {
        type: csts.CONST_RECEIVE,
        response,
        receivedAt: Date.now()
      };
    },
    invalidRequest: (error) => {
      return {
        type: csts.CONST_INVALID,
        title: `Error on ${entitiesName.toLowerCase()} API`,
        message: error,
        level: 'error'
      };
    },
    requestOne: (id) => {
      return {
        type: csts.CONST_REQUEST_ENTITY,
        id
      };
    },
    receiveOne: (response) => {
      return {
        type: csts.CONST_RECEIVE_ENTITY,
        response
      };
    },
    invalidRequestEntity: (entity) => (error) => {
      const entityName = entitiesName.toLowerCase().slice(0, -1);
      const title = entity.title || entity.name || entity.username || entity.id;
      return {
        type: csts.CONST_INVALID_ENTITY,
        title: `Cannot fetch ${entityName} ${title}`,
        message: error,
        level: 'error',
        entity
      };
    },
    requestSave: (entity) => {
      return {
        type: csts.CONST_SAVE_ENTITY,
        entity
      };
    },
    saved: (response) => {
      return {
        type: csts.CONST_ENTITY_SAVED,
        response
      };
    },
    invalidSaveEntity: (entity) => (error) => {
      const entityName = entitiesName.toLowerCase().slice(0, -1);
      const title = entity.title || entity.username || entity.name && (entity.name.raw || entity.name);
      return {
        type: csts.CONST_INVALID_SAVE_ENTITY,
        title: `Cannot save ${entityName} ${title}`,
        message: error,
        level: 'error',
        entity
      };
    },
    requestDelete: (id) => {
      return {
        type: csts.CONST_DELETE_ENTITY,
        id
      };
    },
    deleted: (id) => {
      return {
        type: csts.CONST_ENTITY_DELETED,
        id,
        receivedAt: Date.now()
      };
    },
    invalidDeleteEntity: (entity) => (error) => {
      const entityName = entitiesName.toLowerCase().slice(0, -1);
      const title = entity.title || entity.username || entity.name && (entity.name.raw || entity.name);
      return {
        type: csts.CONST_INVALID_DELETE_ENTITY,
        title: `Cannot delete ${entityName} ${title}`,
        message: error,
        level: 'error',
        entity
      };
    },
    changeFilter: (filterValue) => {
      return {
        type: csts.CHANGE_FILTER,
        filterValue
      };
    },
  };
};

const generateEntitiesFilterValue = (csts) => (state = '', action) => {
  switch (action.type) {
    case csts.CHANGE_FILTER:
      return action.filterValue;
    default:
      return state;
  }
};

const generateEntitiesIsFetching = (csts) => (state = false, action) => {
  switch (action.type) {
    case csts.CONST_REQUEST:
      return true;
    case csts.CONST_RECEIVE:
    case csts.CONST_INVALID:
    case LOCATION_CHANGE:
      return false;
    default:
      return state;
  }
};

const generateEntitiesItems = (csts) => (state = {}, action) => {
  switch (action.type) {
    case csts.CONST_RECEIVE:
    case csts.CONST_RECEIVE_ENTITY:
    case csts.CONST_ENTITY_SAVED:
      if (!action.response.entities) {
        return state;
      }
      return {
        ...state,
        ...action.response.entities.all
      };
    case csts.CONST_REQUEST_ENTITY: {
      const { [action.id]: item, ...restState } = state;
      return { [action.id]: { ...item, isFetching: true }, ...restState };
    }
    case csts.CONST_INVALID_ENTITY: {
      const { [action.id]: item, ...restState } = state;
      return { [action.id]: { ...item, isFetching: false }, ...restState };
    }
    case csts.CONST_ENTITY_DELETED: {
      const { [action.id]: _, ...newState } = state;
      return newState;
    }
    default:
      return state;
  }
};



const generateEntitiesList = (csts) => (state = [], action) => {
  switch (action.type) {
    case csts.CONST_RECEIVE:
      if (!action.response.result) {
        return state;
      }
      return [...state, ...action.response.result];
    case csts.CONST_RECEIVE_ENTITY:
    case csts.CONST_ENTITY_SAVED:
      if (!action.response.result) {
        return state;
      }
      return [...state, action.response.result];
    case csts.CONST_ENTITY_DELETED:
      return state.filter(id => id != action.id);
    default:
      return state;
  }
};

const generateEntityIsFetching = (csts) => (state = false, action) => {
  switch (action.type) {
    case csts.CONST_REQUEST_ENTITY:
    case csts.CONST_SAVE_ENTITY:
    case csts.CONST_DELETE_ENTITY:
      return true;
    case csts.CONST_RECEIVE_ENTITY:
    case csts.CONST_INVALID_ENTITY:
    case csts.CONST_ENTITY_SAVED:
    case csts.CONST_INVALID_SAVE_ENTITY:
    case csts.CONST_ENTITY_DELETED:
    case csts.CONST_INVALID_DELETE_ENTITY:
    case LOCATION_CHANGE:
      return false;
    default:
      return state;
  }
};

const generateEntityId = (csts) => (state = '', action) => {
  switch (action.type) {
    case csts.CONST_REQUEST_ENTITY:
      return action.id || '';
    case csts.CONST_RECEIVE_ENTITY:
    case csts.CONST_ENTITY_SAVED:
      return action.response.result || '';
    case csts.CONST_ENTITY_DELETED:
      return '';
    case csts.CONST_INVALID_ENTITY:
    case csts.CONST_INVALID_SAVE_ENTITY:
    case csts.CONST_INVALID_DELETE_ENTITY:
      return action.entity.id || '';
    default:
      return state;
  }
};

export const generateEntitiesReducer = (entitiesName) => {
  const csts = getConsts(entitiesName);
  const selected = combineReducers({
    isFetching: generateEntityIsFetching(csts),
    id: generateEntityId(csts),
  });
  return combineReducers({
    filterValue: generateEntitiesFilterValue(csts),
    isFetching: generateEntitiesIsFetching(csts),
    items: generateEntitiesItems(csts),
    list: generateEntitiesList(csts),
    selected,
  });
};

export const generateEntitiesThunks = (entitiesName) => {
  const Actions = generateEntitiesActions(entitiesName);
  const fetchAllFunc = () => {
    return (dispatch) => {
      dispatch(Actions.requestAll());
      return fetch(`/api/${entitiesName}`, withAuth({ method: 'GET' }))
        .then(checkHttpStatus)
        .then(parseJSON)
        .then(response => {
          const normalizedResponse = normalize(response, entitiesSchema);
          dispatch(Actions.receiveSome(normalizedResponse));
        })
        .catch(error => {
          handleError(error, Actions.invalidRequest, dispatch);
        });
    };
  };
  const fetchFunc = (id) => {
    return function (dispatch) {
      dispatch(Actions.requestOne(id));
      return fetch(`/api/${entitiesName}/${id}`, withAuth({ method: 'GET' }))
        .then(checkHttpStatus)
        .then(parseJSON)
        .then(response => {
          const normalizedResponse = normalize(response, entitySchema);
          dispatch(Actions.receiveOne(normalizedResponse));
        })
        .catch(error => {
          handleError(error, Actions.invalidRequestEntity({ id }), dispatch);
        });
    };
  };
  const saveFunc = (form, postActionRedirect, postActionToast) => {
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
          const normalizedResponse = normalize(response, entitySchema);
          dispatch(Actions.saved(normalizedResponse));
          postActionRedirect && dispatch(postActionRedirect(response.id));
          postActionToast && dispatch(postActionToast);
        })
        .catch(error => {
          handleError(error, Actions.invalidSaveEntity(entity), dispatch);
        });
    };
  };
  const deleteFunc = (entity, postAction) => {
    return function (dispatch) {
      dispatch(Actions.requestDelete(entity.id));
      let request = new Request(`/api/${entitiesName}/${entity.id}`, withAuth({
        method: 'DELETE'
      }));
      return fetch(request)
        .then(checkHttpStatus)
        .then(parseText)
        .then(response => {
          dispatch(Actions.deleted(response));
          postAction && dispatch(postAction);
        })
        .catch(error => {
          handleError(error, Actions.invalidDeleteEntity(entity), dispatch);
        });
    };
  };
  return {
    fetchAll: fetchAllFunc,
    fetch: fetchFunc,
    save: saveFunc,
    delete: deleteFunc
  };
};

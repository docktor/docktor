import { normalize, schema } from 'normalizr';
import { combineReducers } from 'redux';
import { LOCATION_CHANGE } from 'react-router-redux';
import { withAuth } from '../utils/utils';
import { checkHttpStatus, handleError, parseJSON, parseText } from '../utils/promises';

export const entitySchema = new schema.Entity('all');
export const entitiesSchema = new schema.Array(entitySchema);

//=================================================
// Generate keys for entities
//=================================================
const getKeys = (entitiesName) => {
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

//=================================================
// Generate constants for entities
//=================================================
export const generateEntitiesConstants = (entitiesName) => {
  const csts = getKeys(entitiesName);
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

//=================================================
// Generate actions for entities
//=================================================
export const generateEntitiesActions = (entitiesName) => {
  const csts = getKeys(entitiesName);
  const requestAll = () => ({ type: csts.CONST_REQUEST });
  const receiveSome = (response) => ({ type: csts.CONST_RECEIVE, response });
  const requestOne = (id) => ({ type: csts.CONST_REQUEST_ENTITY, id });
  const receiveOne = (response) => ({ type: csts.CONST_RECEIVE_ENTITY, response });
  const requestSave = (entity) => ({ type: csts.CONST_SAVE_ENTITY, entity });
  const saved = (response) => ({ type: csts.CONST_ENTITY_SAVED, response });
  const requestDelete = (id) => ({ type: csts.CONST_DELETE_ENTITY, id });
  const deleted = (id) => ({ type: csts.CONST_ENTITY_DELETED, id });
  const changeFilter = (filterValue) => ({ type: csts.CHANGE_FILTER, filterValue });
  const invalidRequest = (error) => ({
    type: csts.CONST_INVALID,
    title: `Error on ${entitiesName.toLowerCase()} API`,
    message: error,
    level: 'error'
  });
  const invalidRequestEntity = (entity) => (error) => {
    const entityName = entitiesName.toLowerCase().slice(0, -1);
    const title = entity.title || entity.name || entity.username || entity.id;
    return {
      type: csts.CONST_INVALID_ENTITY,
      title: `Cannot fetch ${entityName} ${title}`,
      message: error,
      level: 'error',
      entity
    };
  };
  const invalidSaveEntity = (entity) => (error) => {
    const entityName = entitiesName.toLowerCase().slice(0, -1);
    const title = entity.title || entity.username || entity.name && (entity.name.raw || entity.name);
    return {
      type: csts.CONST_INVALID_SAVE_ENTITY,
      title: `Cannot save ${entityName} ${title}`,
      message: error,
      level: 'error',
      entity
    };
  };
  const invalidDeleteEntity = (entity) => (error) => {
    const entityName = entitiesName.toLowerCase().slice(0, -1);
    const title = entity.title || entity.username || entity.name && (entity.name.raw || entity.name);
    return {
      type: csts.CONST_INVALID_DELETE_ENTITY,
      title: `Cannot delete ${entityName} ${title}`,
      message: error,
      level: 'error',
      entity
    };
  };
  return {
    requestAll, receiveSome, invalidRequest, requestOne, receiveOne, invalidRequestEntity,
    requestSave, saved, invalidSaveEntity, requestDelete, deleted, invalidDeleteEntity, changeFilter,
  };
};

//=================================================
// Generate reducers for entities
//=================================================
const filterReducer = (csts) => (filterValue = '', action) => {
  switch (action.type) {
    case csts.CHANGE_FILTER:
      return action.filterValue;
    default:
      return filterValue;
  }
};

const isFetchingReducer = (csts) => (isFetching = false, action) => {
  switch (action.type) {
    case csts.CONST_REQUEST:
      return true;
    case csts.CONST_RECEIVE:
    case csts.CONST_INVALID:
    case LOCATION_CHANGE:
      return false;
    default:
      return isFetching;
  }
};

const itemsReducer = (csts) => (items = {}, action) => {
  switch (action.type) {
    case csts.CONST_RECEIVE:
    case csts.CONST_RECEIVE_ENTITY:
    case csts.CONST_ENTITY_SAVED:
      if (!action.response.entities) {
        return items;
      }
      return {
        ...items,
        ...action.response.entities.all
      };
    case csts.CONST_REQUEST_ENTITY: {
      const { [action.id]: item, ...restState } = items;
      return { [action.id]: { ...item, isFetching: true }, ...restState };
    }
    case csts.CONST_SAVE_ENTITY: {
      if (action.entity.id) {
        const { [action.entity.id]: item, ...restState } = items;
        return { [action.entity.id]: { ...item, isFetching: true }, ...restState };
      }
      return items;
    }
    case csts.CONST_DELETE_ENTITY: {
      const { [action.id]: item, ...restState } = items;
      return { [action.id]: { ...item, isFetching: true }, ...restState };
    }
    case csts.CONST_INVALID_ENTITY:
    case csts.CONST_INVALID_SAVE_ENTITY:
    case csts.CONST_INVALID_DELETE_ENTITY: {
      const { [action.entity.id]: item, ...restState } = items;
      return { [action.entity.id]: { ...item, isFetching: false }, ...restState };
    }
    case csts.CONST_ENTITY_DELETED: {
      const { [action.id]: _, ...newState } = items;
      return newState;
    }
    default:
      return items;
  }
};

const listReducer = (csts) => (list = [], action) => {
  switch (action.type) {
    case csts.CONST_RECEIVE:
      if (!action.response.result) {
        return list;
      }
      return [...list, ...action.response.result];
    case csts.CONST_RECEIVE_ENTITY:
    case csts.CONST_ENTITY_SAVED:
      if (!action.response.result) {
        return list;
      }
      return [...list, action.response.result];
    case csts.CONST_ENTITY_DELETED:
      return list.filter(id => id != action.id);
    default:
      return list;
  }
};

const selectedIsFetchingReducer = (csts) => (isFetching = false, action) => {
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
      return isFetching;
  }
};

const selectedIdReducer = (csts) => (id = '', action) => {
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
      return id;
  }
};

export const generateEntitiesReducer = (entitiesName) => {
  const csts = getKeys(entitiesName);
  const selected = combineReducers({
    isFetching: selectedIsFetchingReducer(csts),
    id: selectedIdReducer(csts),
  });
  return combineReducers({
    filterValue: filterReducer(csts),
    isFetching: isFetchingReducer(csts),
    items: itemsReducer(csts),
    list: listReducer(csts),
    selected,
  });
};

//=================================================
// Generate thunks for entities
//=================================================
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
  const saveFunc = (form, postActionRedirect, postActionToast, callback) => {
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
          if (callback) {
            callback();
          }
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
  return { fetchAll: fetchAllFunc, fetch: fetchFunc, save: saveFunc, delete: deleteFunc };
};

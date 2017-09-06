import { expect } from 'chai';
import { normalize } from 'normalizr';

import {
  generateEntitiesConstants,
  generateEntitiesActions,
  generateEntitiesReducer,
  entitiesSchema,
  entitySchema,
} from '../../../src/modules/utils/entities';

describe('Using utilities for entities ->', () => {
  //entity
  const entities = 'generics';
  const entity = entities.slice(0, -1);
  const upperEntities = entities.toUpperCase();
  const upperEntity = upperEntities.slice(0, -1);

  // Initial state
  const reducer = generateEntitiesReducer(entities);
  const initialState = reducer(undefined, { type: undefined });

  //constants
  const CONST_REQUEST = 'REQUEST_' + upperEntities;
  const CONST_RECEIVE = 'RECEIVE_' + upperEntities;
  const CONST_INVALID = 'INVALID_REQUEST_' + upperEntities;
  const CONST_REQUEST_ENTITY = 'REQUEST_' + upperEntity;
  const CONST_RECEIVE_ENTITY = 'RECEIVE_' + upperEntity;
  const CONST_INVALID_ENTITY = 'INVALID_REQUEST_' + upperEntity;
  const CONST_SAVE_ENTITY = 'REQUEST_SAVE_' + upperEntity;
  const CONST_ENTITY_SAVED = upperEntity + '_SAVED';
  const CONST_INVALID_SAVE_ENTITY = 'INVALID_SAVE_' + upperEntity;
  const CONST_DELETE_ENTITY = 'REQUEST_DELETE_' + upperEntity;
  const CONST_ENTITY_DELETED = upperEntity + '_DELETED';
  const CONST_INVALID_DELETE_ENTITY = 'INVALID_DELETE_' + upperEntity;
  const CONST_CHANGE_FILTER = 'CHANGE_FILTER_' + upperEntities;

  //actions
  const item = { id:'testId', test: 'test', name:'Test' };
  const error = { error: 'error' };

  const requestAction = { type: CONST_REQUEST };
  const receivedAction = { type: CONST_RECEIVE, response: normalize([item], entitiesSchema) };
  const invalidAction = { type: CONST_INVALID, level: 'error', message: error, title: `Error on ${entities} API` };

  const requestEntityAction = { type: CONST_REQUEST_ENTITY, id: item.id };
  const receivedEntityAction = { type: CONST_RECEIVE_ENTITY, response: normalize(item, entitySchema) };
  const invalidEntityAction = { type: CONST_INVALID_ENTITY, level: 'error', message: error, title: `Cannot fetch ${entity} ${item.name}`, entity: item };

  const requestSaveAction = { type: CONST_SAVE_ENTITY, entity: item };
  const receivedSavedAction = { type: CONST_ENTITY_SAVED, response: normalize(item, entitySchema) };
  const invalidSaveAction = { type: CONST_INVALID_SAVE_ENTITY, level: 'error', message: error, title: `Cannot save ${entity} ${item.name}`, entity: item };

  const requestDeleteAction = { type: CONST_DELETE_ENTITY, id: item.id };
  const receivedDeletedAction = { type: CONST_ENTITY_DELETED, id: item.id };
  const invalidDeleteAction = { type: CONST_INVALID_DELETE_ENTITY, level: 'error', message: error, title: `Cannot delete ${entity} ${item.name}`, entity: item };

  const changeFilterAction = { type: CONST_CHANGE_FILTER, filterValue: 'test' };

  describe('When generating generic constants,', () => {
    const constants = generateEntitiesConstants(entities);

    it('the result should not be null', () => {
      expect(constants, 'constants').not.to.be.null;
    });

    it('the result should contain 13 constants using "generic" entity', () => {
      expect(Object.values(constants).length, 'constants numbers').to.be.equal(13);
      expect(constants[CONST_REQUEST], 'request all constant').to.be.equal(CONST_REQUEST);
      expect(constants[CONST_RECEIVE], 'receive some constant').to.be.equal(CONST_RECEIVE);
      expect(constants[CONST_INVALID], 'invalid entities constant').to.be.equal(CONST_INVALID);
      expect(constants[CONST_REQUEST_ENTITY], 'request one constant').to.be.equal(CONST_REQUEST_ENTITY);
      expect(constants[CONST_RECEIVE_ENTITY], 'receive one constant').to.be.equal(CONST_RECEIVE_ENTITY);
      expect(constants[CONST_INVALID_ENTITY], 'invalid entity constant').to.be.equal(CONST_INVALID_ENTITY);
      expect(constants[CONST_SAVE_ENTITY], 'save constant').to.be.equal(CONST_SAVE_ENTITY);
      expect(constants[CONST_ENTITY_SAVED], 'saved constant').to.be.equal(CONST_ENTITY_SAVED);
      expect(constants[CONST_INVALID_SAVE_ENTITY], 'invalid save constant').to.be.equal(CONST_INVALID_SAVE_ENTITY);
      expect(constants[CONST_DELETE_ENTITY], 'delete constant').to.be.equal(CONST_DELETE_ENTITY);
      expect(constants[CONST_ENTITY_DELETED], 'deleted constant').to.be.equal(CONST_ENTITY_DELETED);
      expect(constants[CONST_INVALID_DELETE_ENTITY], 'invalid delete constant').to.be.equal(CONST_INVALID_DELETE_ENTITY);
      expect(constants[CONST_INVALID_DELETE_ENTITY], 'invalid delete constant').to.be.equal(CONST_INVALID_DELETE_ENTITY);
      expect(constants[CONST_CHANGE_FILTER], 'invalid change filter constant').to.be.equal(CONST_CHANGE_FILTER);
    });
  });

  describe('When generating generic actions,', () => {
    const actions = generateEntitiesActions(entities);

    it('the result should not be null', () => {
      expect(actions, 'actions').not.to.be.null;
    });

    it('the result should contain 13 actions using constants', () => {
      expect(Object.values(actions).length, 'actions numbers').to.be.equal(13);

      // All
      expect(actions.requestAll(), 'request actions').to.be.deep.equal(requestAction);
      const receivedActionInstance = actions.receiveSome(normalize([item], entitiesSchema));
      expect(receivedActionInstance, 'received action').to.deep.equals(receivedAction);
      expect(actions.invalidRequest(error), 'invalid action').to.be.deep.equal(invalidAction);

      // One
      expect(actions.requestOne(item.id), 'request entity action').to.be.deep.equal(requestEntityAction);
      expect(actions.receiveOne(normalize(item, entitySchema)), 'receive entity action').to.be.deep.equal(receivedEntityAction);
      expect(actions.invalidRequestEntity(item)(error), 'invalid entity action').to.be.deep.equal(invalidEntityAction);

      // Save
      expect(actions.requestSave(item), 'save action').to.be.deep.equal(requestSaveAction);
      expect(actions.saved(normalize(item, entitySchema)), 'saved action').to.be.deep.equal(receivedSavedAction);
      expect(actions.invalidSaveEntity(item)(error), 'invalid save action').to.be.deep.equal(invalidSaveAction);

      // Delete
      expect(actions.requestDelete(item.id), 'delete action').to.be.deep.equal(requestDeleteAction);
      const deletedActionInstance = actions.deleted(item.id);
      expect(deletedActionInstance, 'deleted action').to.be.deep.equal(receivedDeletedAction);
      expect(actions.invalidDeleteEntity(item)(error), 'invalid delete action').to.be.deep.equal(invalidDeleteAction);

      // Filter
      expect(actions.changeFilter('test'), 'change filter action').to.be.deep.equal(changeFilterAction);
    });
  });

  describe('When generating a generic reducer', () => {
    describe('and dispatching a requestAll action,', () => {
      const res = reducer(initialState, requestAction);
      const expectedState = {
        isFetching: true,
        items: {},
        filterValue: '',
        list:[],
        selected: {
          isFetching: false,
          id: ''
        }
      };

      it('the result state should not be empty', () => {
        expect(res, 'result state').not.to.be.empty;
      });

      it('the reducer should be a pure function and not modify the initial state', () => {
        expect(res, 'result state').not.to.be.equal(initialState);
      });

      it('the result state should be equal to expected state', () => {
        expect(res, 'result state').to.be.deep.equal(expectedState);
      });
    });

    describe('and dispatching a receiveSome action,', () => {
      const actions = generateEntitiesActions(entities);
      const action = actions.receiveSome(normalize([item], entitiesSchema));
      const res = reducer(initialState, action);
      const expectedState = {
        isFetching: false,
        items: { testId: item },
        filterValue: '',
        list:[item.id],
        selected: {
          isFetching: false,
          id: ''
        }
      };

      it('the result state should not be empty', () => {
        expect(res, 'result state').not.to.be.empty;
      });

      it('the reducer should be a pure function and not modify the initial state', () => {
        expect(res, 'result state').not.to.be.equal(initialState);
      });

      it('the result state should be equal to expected state', () => {
        expect(res, 'result state').to.be.deep.equal(expectedState);
      });
    });

    describe('and dispatching an invalidRequest action,', () => {
      const initState = { ...initialState, isFetching: true };
      const res = reducer(initState, invalidAction);
      const expectedState = {
        isFetching: false,
        items: {},
        filterValue: '',
        list:[],
        selected: {
          isFetching: false,
          id: ''
        },
      };

      it('the result state should not be empty', () => {
        expect(res, 'result state').not.to.be.empty;
      });

      it('the reducer should be a pure function and not modify the initial state', () => {
        expect(res, 'result state').not.to.be.equal(initState);
      });

      it('the result state should be equal to expected state', () => {
        expect(res, 'result state').to.be.deep.equal(expectedState);
      });
    });

    describe('and dispatching a requestOne action,', () => {
      const res = reducer(initialState, requestEntityAction);
      const expectedState = {
        isFetching: false,
        items: {
          testId: {
            isFetching: true
          }
        },
        filterValue: '',
        list:[],
        selected: {
          isFetching: true,
          id: item.id
        }
      };

      it('the result state should not be empty', () => {
        expect(res, 'result state').not.to.be.empty;
      });

      it('the reducer should be a pure function and not modify the initial state', () => {
        expect(res, 'result state').not.to.be.equal(initialState);
      });

      it('the result state should be equal to expected state', () => {
        expect(res, 'result state').to.be.deep.equal(expectedState);
      });
    });

    describe('and dispatching a revieveOne action,', () => {
      const res = reducer(initialState, receivedEntityAction);
      const expectedState = {
        isFetching: false,
        items: { [item.id]: item },
        filterValue: '',
        list:[item.id],
        selected: {
          isFetching: false,
          id: item.id
        }
      };

      it('the result state should not be empty', () => {
        expect(res, 'result state').not.to.be.empty;
      });

      it('the reducer should be a pure function and not modify the initial state', () => {
        expect(res, 'result state').not.to.be.equal(initialState);
      });

      it('the result state should be equal to expected state', () => {
        expect(res, 'result state').to.be.deep.equal(expectedState);
      });
    });

    describe('and dispatching an invalidRequestEntity action,', () => {
      const res = reducer(initialState, invalidEntityAction);
      const expectedState = {
        isFetching: false,
        items: {
          testId: {
            isFetching: false
          }
        },
        filterValue: '',
        list:[],
        selected: {
          isFetching: false,
          id: item.id
        }
      };

      it('the result state should not be empty', () => {
        expect(res, 'result state').not.to.be.empty;
      });

      it('the reducer should be a pure function and not modify the initial state', () => {
        expect(res, 'result state').not.to.be.equal(initialState);
      });

      it('the result state should be equal to expected state', () => {
        expect(res, 'result state').to.be.deep.equal(expectedState);
      });
    });

    describe('and dispatching a requestSaveAction action,', () => {
      const res = reducer(initialState, requestSaveAction);
      const expectedState = {
        isFetching: false,
        items: {
          testId: {
            isFetching: true
          }
        },
        filterValue: '',
        list:[],
        selected: {
          isFetching: true,
          id: initialState.selected.id
        }
      };

      it('the result state should not be empty', () => {
        expect(res, 'result state').not.to.be.empty;
      });

      it('the reducer should be a pure function and not modify the initial state', () => {
        expect(res, 'result state').not.to.be.equal(initialState);
      });

      it('the result state should be equal to expected state', () => {
        expect(res, 'result state').to.be.deep.equal(expectedState);
      });
    });

    describe('and dispatching a receivedSavedAction action,', () => {
      const res = reducer(initialState, receivedSavedAction);
      const expectedState = {
        isFetching: false,
        items: { [item.id]: { ...item } },
        filterValue: '',
        list:[item.id],
        selected: {
          isFetching: false,
          id: item.id
        }
      };

      it('the result state should not be empty', () => {
        expect(res, 'result state').not.to.be.empty;
      });

      it('the reducer should be a pure function and not modify the initial state', () => {
        expect(res, 'result state').not.to.be.equal(initialState);
      });

      it('the result state should be equal to expected state', () => {
        expect(res, 'result state').to.be.deep.equal(expectedState);
      });
    });

    describe('and dispatching an invalidSaveAction action,', () => {
      const res = reducer(initialState, invalidSaveAction);
      const expectedState = {
        isFetching: false,
        items: {
          testId: {
            isFetching: false
          }
        },
        filterValue: '',
        list:[],
        selected: {
          isFetching: false,
          id: item.id
        }
      };

      it('the result state should not be empty', () => {
        expect(res, 'result state').not.to.be.empty;
      });

      it('the reducer should be a pure function and not modify the initial state', () => {
        expect(res, 'result state').not.to.be.equal(initialState);
      });

      it('the result state should be equal to expected state', () => {
        expect(res, 'result state').to.be.deep.equal(expectedState);
      });
    });

    describe('and dispatching a requestDeleteAction action,', () => {
      const initState = { ...initialState, items: { [item.id]: item }, list: [item.id] };
      const res = reducer(initState, requestDeleteAction);
      const expectedState = {
        isFetching: false,
        items: { [item.id]: { ...item, isFetching: true } },
        filterValue: '',
        list:[item.id],
        selected: {
          isFetching: true,
          id: initialState.selected.id
        }
      };

      it('the result state should not be empty', () => {
        expect(res, 'result state').not.to.be.empty;
      });

      it('the reducer should be a pure function and not modify the initial state', () => {
        expect(res, 'result state').not.to.be.equal(initialState);
      });

      it('the result state should be equal to expected state', () => {
        expect(res, 'result state').to.be.deep.equal(expectedState);
      });
    });

    describe('and dispatching a receivedDeletedAction action,', () => {
      const initState = { ...initialState, items: { [item.id]: item }, list: [item.id] };
      const res = reducer(initState, receivedDeletedAction);
      const expectedState = {
        isFetching: false,
        items: {},
        filterValue: '',
        list:[],
        selected: {
          isFetching: false,
          id: ''
        }
      };

      it('the result state should not be empty', () => {
        expect(res, 'result state').not.to.be.empty;
      });

      it('the reducer should be a pure function and not modify the initial state', () => {
        expect(res, 'result state').not.to.be.equal(initState);
      });

      it('the result state should be equal to expected state', () => {
        expect(res, 'result state').to.be.deep.equal(expectedState);
      });
    });

    describe('and dispatching an invalidDeleteAction action,', () => {
      const initState = { ...initialState, items: { [item.id]: item }, list: [item.id] };
      const res = reducer(initState, invalidDeleteAction);
      const expectedState = {
        isFetching: false,
        items: { [item.id]: { ...item, isFetching: false } },
        filterValue: '',
        list:[item.id],
        selected: {
          isFetching: false,
          id: item.id
        }
      };

      it('the result state should not be empty', () => {
        expect(res, 'result state').not.to.be.empty;
      });

      it('the reducer should be a pure function and not modify the initial state', () => {
        expect(res, 'result state').not.to.be.equal(initialState);
      });

      it('the result state should be equal to expected state', () => {
        expect(res, 'result state').to.be.deep.equal(expectedState);
      });
    });

    describe('and dispatching a change filter action,', () => {
      const res = reducer(initialState, changeFilterAction);
      const expectedState = {
        isFetching: false,
        items: {},
        filterValue: 'test',
        list:[],
        selected: {
          isFetching: false,
          id: ''
        }
      };

      it('the result state should not be empty', () => {
        expect(res, 'result state').not.to.be.empty;
      });

      it('the reducer should be a pure function and not modify the initial state', () => {
        expect(res, 'result state').not.to.be.equal(initialState);
      });

      it('the result state should be equal to expected state', () => {
        expect(res, 'result state').to.be.deep.equal(expectedState);
      });
    });
  });

  // TODO Find a way to test thunks

});

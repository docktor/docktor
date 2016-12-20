import 'babel-polyfill';
import { expect } from 'chai';

import {
  generateEntitiesConstants,
  generateEntitiesActions,
  generateEntitiesReducer,

} from '../../../src/modules/utils/entities.js';

describe('Utilities for entities', () => {
  //entity
  const entity = 'generic';
  const upperEntity = entity.toUpperCase();

  //constants
  const CONST_REQUEST = 'REQUEST_' + upperEntity;
  const CONST_RECEIVE = 'RECEIVE_' + upperEntity;
  const CONST_INVALID = 'INVALID_REQUEST_' + upperEntity;

  //actions
  const requestAction = { type: CONST_REQUEST };
  const item = { id:'testId', test: 'test' };
  const receivedAction = {
    type: CONST_RECEIVE,
    items: [item]
  };
  const error = { error: 'error' };
  const invalidAction = { type: CONST_INVALID, error };

  describe('Generate generic constants', () => {
    const constants = generateEntitiesConstants(entity);

    it('should not be null', () => {
      expect(constants, 'constants').not.to.be.null;
    });

    it('should contain three constants using entity', () => {
      expect(Object.values(constants).length, 'constants numbers').to.be.equal(3);
      expect(constants[CONST_REQUEST], 'request constant').to.be.equal(CONST_REQUEST);
      expect(constants[CONST_RECEIVE], 'receive constant').to.be.equal(CONST_RECEIVE);
      expect(constants[CONST_INVALID], 'invalid constant').to.be.equal(CONST_INVALID);
    });
  });

  describe('Generate generic actions', () => {
    const actions = generateEntitiesActions(entity);

    it('should not be null', () => {
      expect(actions, 'actions').not.to.be.null;
    });

    it('should contain three actions using constants', () => {
      expect(Object.values(actions).length, 'actions numbers').to.be.equal(3);
      expect(actions.requestAll(), 'request actions').to.be.deep.equal(requestAction);
      const receivedActionInstance = actions.received([item]);
      receivedAction.receivedAt = receivedActionInstance.receivedAt;
      expect(receivedActionInstance, 'received action').to.deep.equals(receivedAction);
      expect(actions.invalidRequest(error), 'invalid constant').to.be.deep.equal(invalidAction);
    });
  });

  describe('Generate generic reducer', () => {
    const initialState = {
      isFetching: false,
      didInvalidate: true,
      items: {}
    };

    describe('Dispatch request action', () => {
      const res = generateEntitiesReducer(initialState, requestAction, entity);
      const expectedState = {
        isFetching: true,
        didInvalidate: false,
        items: {}
      };

      it('should not be empty', () => {
        expect(res, 'result state').not.to.be.empty;
      });

      it('should not to be the same object that initial state', () => {
        expect(res, 'result state').not.to.be.equal(initialState);
      });

      it('should be equal to expected state', () => {
        expect(res, 'result state').to.be.deep.equal(expectedState);
      });
    });

    describe('Dispatch received action', () => {
      const actions = generateEntitiesActions(entity);
      const action = actions.received([item]);
      const res = generateEntitiesReducer(initialState, action, entity);
      const expectedState = {
        isFetching: false,
        didInvalidate: false,
        items: { testId: item },
        lastUpdated: action.receivedAt
      };

      it('should not be empty', () => {
        expect(res, 'result state').not.to.be.empty;
      });

      it('should not to be the same object that initial state', () => {
        expect(res, 'result state').not.to.be.equal(initialState);
      });

      it('should be equal to expected state', () => {
        expect(res, 'result state').to.be.deep.equal(expectedState);
      });
    });

    describe('Dispatch invalid request action', () => {
      const res = generateEntitiesReducer(initialState, invalidAction, entity);
      const expectedState = {
        isFetching: false,
        didInvalidate: true,
        items: {}
      };

      it('should not be empty', () => {
        expect(res, 'result state').not.to.be.empty;
      });

      it('should not to be the same object that initial state', () => {
        expect(res, 'result state').not.to.be.equal(initialState);
      });

      it('should be equal to expected state', () => {
        expect(res, 'result state').to.be.deep.equal(expectedState);
      });
    });
  });

  // TODO Find a way to test thunks

});

import { combineReducers } from 'redux';

// import constants
import { ModalConstants } from './modal.actions';

const isVisible = (state = false, action) => {
  switch (action.type) {
    case ModalConstants.CLOSE_MODAL:
      return false;
    case ModalConstants.OPEN_MODAL:
      return true;
    default:
      return state;
  }
};

const title = (state = '', action) => {
  switch (action.type) {
    case ModalConstants.CLOSE_MODAL:
      return '';
    case ModalConstants.OPEN_MODAL:
      return action.title;
    default:
      return state;
  }
};

const form = (state = { lines: [], hidden: [] }, action) => {
  switch (action.type) {
    case ModalConstants.CLOSE_MODAL:
      return { lines: [], hidden: [] };
    case ModalConstants.OPEN_MODAL:
      return action.form;
    default:
      return state;
  }
};

const callback = (state = null, action) => {
  switch (action.type) {
    case ModalConstants.CLOSE_MODAL:
      return null;
    case ModalConstants.OPEN_MODAL:
      return action.callback;
    default:
      return state;
  }
};

const modalReducer = combineReducers({
  isVisible,
  title,
  form,
  callback,
});

export default modalReducer;

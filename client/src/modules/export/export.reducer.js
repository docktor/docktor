import { combineReducers } from 'redux';

// import constants
import { ExportConstants } from './export.actions';

const isFetching = (state = false, action) => {
  switch (action.type) {
    case ExportConstants.EXPORT_ALL_REQUEST:
      return true;
    case ExportConstants.EXPORT_ALL_SUCCESS:
    case ExportConstants.EXPORT_ALL_INVALID_REQUEST:
      return false;
    default:
      return state;
  }
};

const errorMessage = (state = '', action) => {
  switch (action.type) {
    case ExportConstants.EXPORT_ALL_REQUEST:
    case ExportConstants.EXPORT_ALL_SUCCESS:
      return '';
    case ExportConstants.EXPORT_ALL_INVALID_REQUEST:
      return action.error;
    default:
      return state;
  }
};

const exportReducer = combineReducers({
  isFetching,
  errorMessage,
});

export default exportReducer;

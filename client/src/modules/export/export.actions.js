// import constants
import ExportConstants from './export.constants';

// ==== Export all actions

// Action when requesting the generation of an export
const requestExportAll = () => {
  return {
    type: ExportConstants.EXPORT_ALL_REQUEST
  };
};

// Action when export is in success
const receiveExportAll = () => {
  return {
    type: ExportConstants.EXPORT_ALL_SUCCESS,
  };
};

// Action when a technical error happens when exporting data of Docktor
const invalidRequestExportAll = (error) => {
  return {
    type: ExportConstants.EXPORT_ALL_INVALID_REQUEST,
    title: 'Cannot generate an export because of technical error',
    message: error,
    level: 'error'
  };
};

export default {
  requestExportAll,
  receiveExportAll,
  invalidRequestExportAll,
};

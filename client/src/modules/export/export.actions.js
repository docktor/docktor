// import constants
import ExportConstants from './export.constants.js';

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
    error
  };
};

export default {
  requestExportAll,
  receiveExportAll,
  invalidRequestExportAll,
};

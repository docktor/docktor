//=================================================
// Export constants
//=================================================

export const ExportConstants = {
  EXPORT_ALL_REQUEST : 'EXPORT_ALL_REQUEST',
  EXPORT_ALL_SUCCESS : 'EXPORT_ALL_SUCCESS',
  EXPORT_ALL_INVALID_REQUEST : 'EXPORT_ALL_INVALID_REQUEST'
};


//=================================================
// Export actions
//=================================================

// Action when requesting the generation of an export
const requestExportAll = () => ({ type: ExportConstants.EXPORT_ALL_REQUEST });

// Action when export is in success
const receiveExportAll = () => ({ type: ExportConstants.EXPORT_ALL_SUCCESS });

// Action when a technical error happens when exporting data of Docktor
const invalidRequestExportAll = (error) => ({
  type: ExportConstants.EXPORT_ALL_INVALID_REQUEST,
  title: 'Cannot generate an export because of technical error',
  message: error,
  level: 'error'
});

export default { requestExportAll, receiveExportAll, invalidRequestExportAll };

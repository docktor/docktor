// Imports for fetch API
import 'babel-polyfill';
import { withAuth } from '../auth/auth.wrappers.js';
import { checkHttpStatus, parseJSON, handleError } from '../utils/promises.js';
import { download } from '../utils/files.js';

// Export actions
import ExportActions from './export.actions.js';


// Calls the API to export Docktor
const exportAll = () => {

  return dispatch => {
    // We dispatch requestLogin to kickoff the call to the API
    dispatch(ExportActions.requestExportAll());

    return fetch('/api/export', withAuth({ method:'GET' }))
      .then(checkHttpStatus)
      .then(response => {
        response.blob().then( blob => {
          console.log(response);
          console.log(blob);
          download(blob, 'docktor.xlsx');
          dispatch(ExportActions.receiveExportAll());
        });
      })
      .catch(error => {
        handleError(error, ExportActions.invalidRequestExportAll, dispatch);
      });
  };
};

export default {
  exportAll
};

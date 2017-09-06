import { withAuth, download } from '../utils/utils';
import { checkHttpStatus, handleError } from '../utils/promises';

// Export actions
import ExportActions from './export.actions';


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

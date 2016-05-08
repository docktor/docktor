// Entities Actions
import { fetchSitesIfNeeded } from './sites.actions.js'

// Thunk which fetch entities on location changes
export function routeLocationDidUpdate(location) {
  return function (dispatch) {
    switch (location.pathname) {
        case "/sites":
            dispatch(fetchSitesIfNeeded())
            break;
    }
  }
}

export default routeLocationDidUpdate
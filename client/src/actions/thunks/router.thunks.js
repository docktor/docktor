import { fetchSitesIfNeeded } from './sites.thunks.js'
import { locationChanged } from '../router.actions.js'

// Thunk which fetch entities on location changes
export function routeLocationDidUpdate(location) {
  return function (dispatch) {
    dispatch(locationChanged())
    switch (location.pathname) {
        case "/sites":
            dispatch(fetchSitesIfNeeded())
            break;
    }
  }
}
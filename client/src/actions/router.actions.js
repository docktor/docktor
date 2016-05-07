import { fetchSitesIfNeeded } from './sites.actions.js'


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
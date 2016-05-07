import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import { Provider } from 'react-redux'
import { Router, Route, browserHistory } from 'react-router'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'

// Actions
import { routeLocationDidUpdate } from './actions/router.actions.js'

// Reducers
import sites from './reducers/sites.reducer.js'

//Components
import App from './components/app/app.js'
import SiteMap from './components/sites/sites.js'

const loggerMiddleware = createLogger()

// Add the reducer to your store on the `routing` key
const store = createStore(
  combineReducers(
    {
      sites,
      routing: routerReducer
    }
  ),
  applyMiddleware(thunkMiddleware, loggerMiddleware)
)

// Create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(browserHistory, store)
history.listen(location => store.dispatch(routeLocationDidUpdate(location)));

ReactDOM.render(
  <Provider store={store}>
    { /* Tell the Router to use our enhanced history */ }
    <Router history={history}>
      <Route path="/" component={App}>
        <Route path="/sites" component={SiteMap} />
      </Route>
    </Router>
  </Provider>,
  document.getElementById('root')
)
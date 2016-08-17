import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux';

// Actions
import { routeLocationDidUpdate } from './modules/router/router.thunks.js';

// Reducers
import sites from './modules/sites/sites.reducer.js';
import daemons from './modules/daemons/daemons.reducer.js';
import users from './modules/users/users.reducer.js';
import toasts from './modules/toasts/toasts.reducer.js';
import modal from './modules/modal/modal.reducer.js';

//Components
import App from './pages/app/app.js';
import DaemonsPage from './pages/daemons/daemons.js';
import UsersPage from './pages/users/users.js';
import LoginPage from './pages/login/login.js';

const loggerMiddleware = createLogger();

// Add the reducer to your store on the `routing` key
const store = createStore(
  combineReducers(
    {
      sites,
      daemons,
      users,
      toasts,
      modal,
      routing: routerReducer
    }
  ),
  applyMiddleware(thunkMiddleware, loggerMiddleware)
);

// Create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(browserHistory, store);
history.listen(location => store.dispatch(routeLocationDidUpdate(location)));

ReactDOM.render(
  <Provider store={store}>
    {/* Tell the Router to use our enhanced history */}
    <Router history={history}>
      <Route path='/' component={App}>
        <Route path='/daemons' component={DaemonsPage} />
        <Route path='/users' component={UsersPage} />
        <Route path='/login' component={LoginPage} />
      </Route>
    </Router>
  </Provider>,
  document.getElementById('root')
);

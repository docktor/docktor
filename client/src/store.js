import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import createHistory from 'history/createBrowserHistory';
import { routerMiddleware } from 'react-router-redux';
import { composeWithDevTools } from 'redux-devtools-extension';

// Thunks
import AuthThunks from './modules/auth/auth.thunk';

// Reducers
import reducers from './reducers';


// Create a history of your choosing (we're using a browser history in this case)
export const history = createHistory();

// Configure middlewares
const rMiddleware = routerMiddleware(history);
let defaultMiddlewares = [thunkMiddleware, rMiddleware];
let middlewares;
if (process.env.NODE_ENV !== 'production') {
  // Dev dependencies
  const loggerMiddleware = createLogger();
  defaultMiddlewares = [...defaultMiddlewares, loggerMiddleware];
  middlewares = composeWithDevTools(applyMiddleware(...defaultMiddlewares));
} else {
  middlewares = applyMiddleware(...defaultMiddlewares);
}

// Add the reducer to your store on the `routing` key
export const store = createStore(
  reducers,
  middlewares,
);

const authToken = localStorage.getItem('id_token');
if (authToken) {
  store.dispatch(AuthThunks.profile());
}

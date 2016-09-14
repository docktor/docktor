// import constants
import ServicesConstants from './services.constants.js';

// Request all services
export function requestAllServices() {
  return {
    type: ServicesConstants.REQUEST_ALL_SERVICES
  };
}


// Services are received
export function receiveServices(services) {
  return {
    type: ServicesConstants.RECEIVE_SERVICES,
    services,
    receivedAt: Date.now()
  };
}

// Services API returns an Error
export function invalidRequestServices(error) {
  return {
    type: ServicesConstants.INVALID_REQUEST_SERVICES,
    error
  };
}

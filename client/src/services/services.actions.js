// Request all services
export const REQUEST_ALL_SERVICES = 'REQUEST_ALL_SERVICES';

export function requestAllServices() {
  return {
    type: REQUEST_ALL_SERVICES
  };
}


// Services are received
export const RECEIVE_SERVICES = 'RECEIVE_SERVICES';

export function receiveServices(services) {
  return {
    type: RECEIVE_SERVICES,
    services,
    receivedAt: Date.now()
  };
}

// Services API returns an Error
export const INVALID_REQUEST_SERVICES = 'INVALID_REQUEST_SERVICES';

export function invalidRequestServices(error) {
  return {
    type: INVALID_REQUEST_SERVICES,
    error
  };
}

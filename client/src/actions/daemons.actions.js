// Request all daemons
export const REQUEST_ALL_DAEMONS = 'REQUEST_ALL_DAEMONS'

export function requestAllDaemons() {
  return {
    type: REQUEST_ALL_DAEMONS
  }
}


// Daemons are received
export const RECEIVE_DAEMONS = 'RECEIVE_DAEMONS'

export function receiveDaemons(daemons) {
  return {
    type: RECEIVE_DAEMONS,
    daemons,
    receivedAt: Date.now()
  }
}

// Daemons API returns an Error
export const INVALID_REQUEST_DAEMONS = 'INVALID_REQUEST_DAEMONS'

export function invalidRequestDaemons(error) {
  return {
    type: INVALID_REQUEST_DAEMONS,
    error
  }
}
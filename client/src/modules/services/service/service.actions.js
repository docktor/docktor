// import constants
import ServiceConstants from './service.constants.js';

// Request a services
const requestService = (id) => {
  return {
    type: ServiceConstants.REQUEST_SERVICE,
    id
  };
};

// Service is received
const receiveService = (service) => {
  return {
    type: ServiceConstants.RECEIVE_SERVICE,
    service
  };
};

// Request to save a service
const requestSaveService = (service) => {
  return {
    type: ServiceConstants.REQUEST_SAVE_SERVICE,
    service
  };
};

// Service is saved
const serviceSaved = (service) => {
  return {
    type: ServiceConstants.SERVICE_SAVED,
    service
  };
};

// Request site deletion
const requestDeleteService = (id) => {
  return {
    type: ServiceConstants.REQUEST_DELETE_SERVICE,
    id
  };
};

// Service is deleted
const serviceDeleted = (response) => {
  return {
    type: ServiceConstants.SERVICE_DELETED,
    id: response.id,
    receivedAt: Date.now()
  };
};


// Service API returns an Error
const invalidRequestService = (error) => {
  return {
    type: ServiceConstants.INVALID_REQUEST_SERVICE,
    error
  };
};

// New Service
const newService = () => {
  return {
    type: ServiceConstants.NEW_SERVICE
  };
};

export default {
  requestService,
  receiveService,
  requestSaveService,
  serviceSaved,
  requestDeleteService,
  serviceDeleted,
  invalidRequestService,
  newService
};

// import constants
import ServicesConstants from './services.constants.js';
import { generateEntitiesActions } from '../utils/entities.js';

// Change filter
const changeFilter = (filterValue) => {
  return {
    type: ServicesConstants.CHANGE_FILTER,
    filterValue
  };
};

// Request a services
const requestService = (id) => {
  return {
    type: ServicesConstants.REQUEST_SERVICE,
    id
  };
};

// Service is received
const receiveService = (service) => {
  return {
    type: ServicesConstants.RECEIVE_SERVICE,
    service
  };
};

// Request to save a service
const requestSaveService = (service) => {
  return {
    type: ServicesConstants.REQUEST_SAVE_SERVICE,
    service
  };
};

// Service is saved
const serviceSaved = (service) => {
  return {
    type: ServicesConstants.SERVICE_SAVED,
    service
  };
};

// Request site deletion
const requestDeleteService = (id) => {
  return {
    type: ServicesConstants.REQUEST_DELETE_SERVICE,
    id
  };
};

// Service is deleted
const serviceDeleted = (response) => {
  return {
    type: ServicesConstants.SERVICE_DELETED,
    id: response,
    receivedAt: Date.now()
  };
};


// Service API returns an Error
const invalidRequestService = (error) => {
  return {
    type: ServicesConstants.INVALID_REQUEST_SERVICE,
    error
  };
};

export default {
  ...generateEntitiesActions('services'),
  changeFilter,
  requestService,
  receiveService,
  requestSaveService,
  serviceSaved,
  requestDeleteService,
  serviceDeleted,
  invalidRequestService
};

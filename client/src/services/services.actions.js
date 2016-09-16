// import constants
import ServicesConstants from './services.constants.js';
import { generateEntitiesActions } from '../utils/entities.js';

export default {
  ...generateEntitiesActions('services')
};

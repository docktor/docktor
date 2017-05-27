// import constants
import { generateEntitiesActions, generateEntitiesConstants } from '../utils/entities';

//=================================================
// Services constants
//=================================================

export const ServicesConstants = {
  ...generateEntitiesConstants('services'),
};


//=================================================
// Services actions
//=================================================

export default {
  ...generateEntitiesActions('services'),
};

import { generateEntitiesActions, generateEntitiesConstants } from '../utils/entities';

//=================================================
// Sites constants
//=================================================

export const SitesConstants = {
  ...generateEntitiesConstants('sites')
};


//=================================================
// Sites actions
//=================================================

export default {
  ...generateEntitiesActions('sites')
};

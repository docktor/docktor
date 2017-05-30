import { generateEntitiesActions, generateEntitiesConstants } from '../utils/entities';

//=================================================
// Tags constants
//=================================================

export const TagsConstants = {
  ...generateEntitiesConstants('tags')
};


//=================================================
// Tags actions
//=================================================

export default {
  ...generateEntitiesActions('tags')
};

const CRITERIA_SEPARATOR = ',';
const CRITERION_SEPARATOR = ':';

export const transformFilterToObject = (filter) => {
  const result = {};
  const criteria = filter.split(CRITERIA_SEPARATOR);
  criteria.forEach(criterion => {
    const criterionDefinition = criterion.trim().split(CRITERION_SEPARATOR);
    if (criterionDefinition.length > 1) {
      const key = criterionDefinition[0].trim();
      const value = criterionDefinition[1].trim();
      result[key] = value;
    } else {
      result['text'] = criterionDefinition[0].trim();
    }
  });
  return result;
};

import Joi from 'joi-browser';

export const createSchemaModal = (modal) => {
  let obj = {};
  modal.form.lines.forEach(line => {
    obj = { ...obj, ...createSchema(line.fields) };
  });
  return Joi.object().keys(obj);
};

export const createSchemaArray = (fields) => {
  return Joi.array().items(Joi.object().keys(createSchema(fields)));
};

const createSchema = (fields) => {
  const obj = {};
  fields.forEach(field => {
    let rule;
    switch (field.type) {
    case 'email':
      rule = Joi.string().email().trim();
      break;
    case 'number':
      rule = Joi.number();
      break;
    default:
      rule = Joi.string().trim();
      break;
    }
    if (field.required) {
      rule = rule.required().label(field.label || field.name);
    }
    obj[field.name] = rule;
  });
  return obj;
};

export const parseError = (error) => {
  const fields = {};
  const details = [];
  error && error.details.forEach(err => {
    fields[err.path] = true;
    details.push(err.message);
  });
  return { details, fields };
};

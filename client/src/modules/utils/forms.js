import Joi from 'joi-browser';

export const createSchema = (modal) => {
  const obj = {};
  modal.form.lines.forEach(line => {
    line.fields.forEach(field => {
      let rule;
      switch (field.type) {
      case 'email':
        rule = Joi.string().email().trim();
        break;
      case 'number':
        rule = Joi.number();
        break;
      default:
        rule = Joi.string();
        break;
      }
      if (field.required) {
        rule = rule.required().label(field.label || field.name);
      }
      obj[field.name] = rule;
    });
  });
  return Joi.object().keys(obj);
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

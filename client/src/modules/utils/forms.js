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
      case 'tags':
        rule = Joi.array();
        break;
      default:
        rule = Joi.string().trim();
        break;
    }
    if (field.required) {
      rule = rule.required();
    } else {
      rule = rule.allow('');
    }
    obj[field.name] = rule.label(field.label || field.name);
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

export const parseErrorArray = (error) => {
  const fields = {};
  const details = [];
  error && error.details.forEach(err => {
    const [index, path] = err.path.split('.');
    fields[index] = { ...fields[index], [path]:true };
    details.push(err.message);
  });
  return { details, fields };
};

const objectToQueryString = (formData) => {
  return Object.keys(formData)
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(formData[k])}`)
    .join('&');
};

// Encode the form with its data to avoid problem with reserved characters
export const encodeForm = (formData) => {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: objectToQueryString(formData)
  };
};

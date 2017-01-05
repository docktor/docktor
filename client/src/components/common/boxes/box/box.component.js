// React
import React from 'react';
import { Header, Form, Button, Modal, Message, Icon, Popup, Input, Dropdown } from 'semantic-ui-react';
import classNames from 'classnames';
import Joi from 'joi-browser';

import HeadingBox from './heading.box.component.js';
import { createSchemaArray, parseErrorArray } from '../../../../modules/utils/forms.js';

import './box.component.scss';

// Box is a form with list of lines
class Box extends React.Component {

  state = { errors: { details: [], fields: {} }, schema: {}, lines: [] }

  componentWillMount = () => {
    const { form, lines } = this.props;
    this.syncBox(form, lines);
  }

  componentDidUpdate() {
    this.props.onChange(this.state.lines);
  }

  syncBox = (form, lines) => {
    this.setState({ schema:createSchemaArray(form.fields), lines, errors: { details: [], fields: {} } });
  }

  onAddLine = (e) => {
    e.preventDefault();
    const state = { lines: [...this.state.lines] };
    const line = {};
    this.props.form.fields.forEach(field => {
      line[field.name] = '';
    });
    state.lines.push(line);
    this.setState(state);
  }

  onRemoveLine = (index) => (e) => {
    e.preventDefault();
    const state = { lines: [...this.state.lines] };
    state.lines.splice(index, 1);
    this.setState(state);
  }

  onChangeLine = (index, property) => (e, { value }) => {
    e.preventDefault();
    const { lines, errors } = this.state;
    const state = { lines: [...lines], errors: { details: [...errors.details], fields: { ...errors.fields } } };
    state.lines[index][property] = value;
    state.errors.fields[index] && delete state.errors.fields[index][property];
    this.setState(state);
  }

  isFormValid = () => {
    const { lines, schema } = this.state;
    const { error } = Joi.validate(lines, schema, { abortEarly: false, allowUnknown: true });
    error && this.setState({ errors: parseErrorArray(error) });
    return !Boolean(error);
  }

  renderDropdown = (line, index, field, popup, errors) => {
    const error = errors[index] && errors[index][field.name];
    const options = field.options || [];
    const search = field.type === 'autocomplete';
    const dropdownOptions = options.map(option => {
      return {
        icon: option.icon,
        value: field.type == 'dropdown' ? option.id : option.value,
        text: option.name
      };
    });
    return (
      <Form.Dropdown key={field.name + index} name={field.name} label={<label className='hidden'>{field.label}</label>} fluid search={search}
        title={popup} value={line[field.name]} selection placeholder={field.placeholder} autoComplete='off' options={dropdownOptions}
        required={field.required} onChange={this.onChangeLine(index, field.name)} className={field.class} loading={!options} error={error}
      />
    );
  }

  renderTextArea = (line, index, field, popup, errors) => {
    const error = errors[index] && errors[index][field.name];
    return (
      <Form.TextArea key={field.name + index} name={field.name} label={<label className='hidden'>{field.label}</label>}
        title={popup} rows={field.rows} value={line[field.name]} placeholder={field.placeholder} autoComplete='off'
        required={field.required} onChange={this.onChangeLine(index, field.name)} className={field.class} error={error}
      />
    );
  }

  renderInput = (line, index, field, popup, errors) => {
    const error = errors[index] && errors[index][field.name];
    return (
      <Form.Input key={field.name + index} name={field.name} label={<label className='hidden'>{field.label}</label>}
        title={popup} type={field.type || 'text'} value={line[field.name]} placeholder={field.placeholder} autoComplete='off'
        required={field.required} onChange={this.onChangeLine(index, field.name)} className={field.class} error={error}
      />
    );
  }

  renderLine = (line, index, form, errors) => {
    const popup = form.getTitle(line);
    return (
      <Form.Group key={index}>
        {form.fields.map(field => {
<<<<<<< HEAD
          if (field.type === 'select' || field.type === 'autocomplete') {
            return this.renderDropdown(line, index, field, popup);
=======
          if (field.type === 'select') {
            return this.renderDropdown(line, index, field, popup, errors);
>>>>>>> b96ade6... feat: refact selector + add validation on boxes
          } else if (field.type === 'textarea') {
            return this.renderTextArea(line, index, field, popup, errors);
          } else {
            return this.renderInput(line, index, field, popup, errors);
          }
        })}
        <Form.Button color='red' icon='trash' onClick={this.onRemoveLine(index)} />
      </Form.Group>
    );
  }

  renderHeader = (form) => {
    if(!this.state.lines.length) {
      return '';
    } else {
      return (
        <Form.Group className='header'>
          {form.fields.map(field => {
            return (
              <Form.Field key={'header-' + field.name} className={field.class} required={field.required} label={null}>
                <label>{field.label}</label>
              </Form.Field>
            );
          })}
          <Form.Field width='one'>
            <label />
          </Form.Field>
        </Form.Group>
      );
    }
  }

  render() {
    const { title, icon, form, stacked } = this.props;
    const { fields, details } = this.state.errors;
    return (
      <Form as={HeadingBox} className='box-component' icon={icon} title={title} stacked={stacked}>
        {this.props.children || ''}
        {this.renderHeader(form)}
        {this.state.lines.map((line, index) => {
          return this.renderLine(line, index, form, fields);
        })}
        <Button content={'Add ' + title} icon='plus' labelPosition='left' color='green' onClick={this.onAddLine} />
      </Form>
    );
  }
};

Box.propTypes = {
  title: React.PropTypes.string.isRequired,
  icon: React.PropTypes.string.isRequired,
  lines: React.PropTypes.array.isRequired,
  form: React.PropTypes.object.isRequired,
  stacked: React.PropTypes.bool,
  children: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.element
  ]),
  onChange: React.PropTypes.func.isRequired
};

export default Box;

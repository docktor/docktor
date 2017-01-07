// React
import React from 'react';
import { connect } from 'react-redux';
import { Header, Form, Button, Modal, Message, Icon, Popup, Input, Dropdown } from 'semantic-ui-react';
import classNames from 'classnames';
import Joi from 'joi-browser';

// Actions for redux container
import ModalActions from '../../../modules/modal/modal.actions.js';
import { createSchemaModal, parseError } from '../../../modules/utils/forms.js';

// Components
import Rodal from 'rodal';

// Style
import './modal.component.scss';

// Modal Component
class ModalComponent extends React.Component {

  state = { errors: { details: [], fields: {} }, form: {}, schema: {}, options: {} }

  componentWillMount = () => {
    this.syncModal(this.props.modal);
  }

  componentWillReceiveProps = (nextProps) => {
    this.syncModal(nextProps.modal);
  }

  syncModal = (modal) => {
    const form = {};
    const options = {};
    modal.form.lines.forEach(line => {
      line.fields.forEach(field => {
        form[field.name] = field.value;
        if(field.options) {
          options[field.name] = field.options;
        }
      });
    });
    modal.form.hidden.map(field => form[field.name] = field.value);
    this.setState({ schema:createSchemaModal(modal), form, errors: { details: [], fields: {} }, options });
  }

  handleAddition = (e, { name, value }) => {
    const options = this.state.options;
    const opts = options[name] || [];
    const state = {
      options: { ...options, [name]: [...opts, { text:value, value }] }
    };
    this.setState(state);
  }

  handleChange = (e, { name, value }) => {
    this.setState({ form: { ...this.state.form, [name]:value } });
  }

  validate = (e) => {
    e.preventDefault();
    const modal = this.props.modal;
    const { form, schema } = this.state;
    const { error } = Joi.validate(form, schema, { abortEarly: false, allowUnknown: true });
    if (error) {
      this.setState({ errors: parseError(error) });
    } else {
      modal.callback(this.state.form);
      this.props.onClose();
    }
  }

  // Render the input field, depending on the type (ex: text, dropdown, etc.)
  renderInputField = (field) => {
    const { form, options } = this.state;
    const opts = options[field.name] || [];
    switch (field.type) {
    case 'dropdown':
    case 'autocomplete':
    case 'tags':
      const search = field.type === 'autocomplete' || field.type === 'tags';
      const multiple = field.type === 'tags';
      const dropdownOptions = opts.map(option => {
        return {
          icon: option.icon && <Icon name={option.icon} color={option.color || null}/>,
          value: field.type == 'dropdown' ? option.id : option.value,
          text: option.value
        };
      });
      const value = multiple ? (form[field.name] || []) : form[field.name];
      return (
        <Dropdown placeholder={field.placeholder} name={field.name} value={value} allowAdditions={search} onAddItem={this.handleAddition}
          fluid search={search} multiple={multiple} selection options={dropdownOptions} onChange={this.handleChange}
        />
      );
    default:
      // Default component for text/email/numbers...
      return (
        <Input fluid type={field.type} name={field.name} placeholder={field.placeholder} defaultValue={form[field.name]} onChange={this.handleChange}/>
      );
    }
  }

  renderPopup = (field) => (
    <Popup
      trigger={<Icon name='help circle' link className='with-title' />}
      content={field.help} positioning='left center' inverted wide='very'
    />
  )

  renderField = (field, errors) => (
    <Form.Field key={field.name} error={errors[field.name]} label={null} required={field.required} className={field.class}>
      {field.help ?  this.renderPopup(field) : ''}
      <label>{field.label || field.name}</label>
      {this.renderInputField(field)}
    </Form.Field>
  );

  render() {
    const { modal, onClose } = this.props;
    const { fields, details } = this.state.errors;
    const modalClasses = classNames('ui', { active: modal.isVisible }, 'small modal');
    return (
      <Rodal visible={modal.isVisible}
        onClose={onClose}
        showCloseButton={false}
        animation={modal.animation}>
        <div className={modalClasses}>
          <Icon name='close' onClick={onClose} />
          <Header content={modal.title} />
          <Modal.Content>
            <Form error={Boolean(details.length)}>
              {modal.form.lines.map((line, index) => (
                <Form.Group key={index} className={line.class}>
                  {line.fields.map(field => this.renderField(field, fields))}
                </Form.Group>
              ))}
              <Message error list={details}/>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button content='Cancel' color='black' onClick={onClose} />
            <Button content='Validate' icon='checkmark' labelPosition='right' color='teal' onClick={this.validate} />
          </Modal.Actions>
        </div>
      </Rodal>
    );
  }
}

ModalComponent.propTypes = { modal: React.PropTypes.object, onClose: React.PropTypes.func };

// Function to map state to container props
const mapStateToModalProps = (state) => {
  return { modal: state.modal };
};

// Function to map dispatch to container props
const mapDispatchToModalProps = (dispatch) => {
  return { onClose: () => dispatch(ModalActions.closeModal()) };
};

// Redux container to Sites component
const ModalContainer = connect(
  mapStateToModalProps,
  mapDispatchToModalProps
)(ModalComponent);

export default ModalContainer;

// React
import React from 'react';
import { connect } from 'react-redux';
import { Header, Form, Button, Modal, Message, Icon, Popup, Input, Dropdown } from 'semantic-ui-react';
import Joi from 'joi-browser';
import classNames from 'classnames';

// Actions for redux container
import ModalActions from '../../../modules/modal/modal.actions.js';
import { createSchema, parseError } from '../../../modules/utils/forms.js';

// Components
import Rodal from 'rodal';

// Style
import './modal.component.scss';

// Modal Component
class ModalComponent extends React.Component {

  state = { errors: { details: [], fields: {} }, form: {}, schema: {} }

  componentWillMount = () => {
    this.syncModal(this.props.modal);
  }

  componentWillReceiveProps = (nextProps) => {
    this.syncModal(nextProps.modal);
  }

  syncModal = (modal) => {
    const form = {};
    modal.form.lines.forEach(line => {
      line.fields.forEach(field => form[field.name] = field.value);
    });
    modal.form.hidden.map(field => form[field.name] = field.value);
    this.setState({ schema:createSchema(modal), form, errors: { details: [], fields: {} } });
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
    const { form } = this.state;
    const options = field.options || [];
    switch (field.type) {
    case 'dropdown':
    case 'autocomplete':
    case 'tags':
      const search = field.type === 'autocomplete' || field.type === 'tags';
      const multiple = field.type === 'tags';
      const dropdownOptions = options.map(option => {
        return {
          icon: option.icon,
          value: field.type == 'dropdown' ? option.id : option.value,
          text: option.value
        };
      });
      return (
        <Dropdown placeholder={field.desc} name={field.name} value={form[field.name]} allowAdditions={search}
          fluid search={search} multiple={multiple} selection options={dropdownOptions} onChange={this.handleChange}
        />
      );
    default:
      // Default component for text/email/numbers...
      return (
        <Input fluid type={field.type} name={field.name} placeholder={field.desc} defaultValue={form[field.name]} onChange={this.handleChange}/>
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
  <Form.Field key={field.name} error={errors[field.name]} label={null} required={field.required}>
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
            <Form error={!!details.length}>
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

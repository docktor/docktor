// React
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Header, Form, Message, Button, Icon, Modal } from 'semantic-ui-react';
import Joi from 'joi-browser';

import Rodal from 'rodal';

import { UsersConstants } from '../../../modules/users/users.actions';
import { parseError } from '../../../modules/utils/forms';

// Style
import '../../common/tabform/tabform.component.scss';

// ProfilePane containg fields to edit an existing account
class ProfilePane extends React.Component {

  state = {
    isRemovalModalVisible: false,
    errors: { details: [], fields: {}, user: {} }
  };

  schema = Joi.object().keys({
    username: Joi.string().trim().alphanum().required().label('Username'),
    email: Joi.string().email().trim().required().label('Email'),
    firstName: Joi.string().trim().required().label('Firstname'),
    lastName: Joi.string().trim().required().label('Lastname')
  })

  componentWillMount = () => {
    const { user } = this.props;
    this.setState({ user: {
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    } });
  }

  componentWillReceiveProps = (nextProps) => {
    const { user } = nextProps;
    this.setState({ user: {
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    } });
  }

  isDisabled = (user) => {
    return user.provider !== UsersConstants.USER_LOCAL_PROVIDER;
  }

  removeAccount = (e) => {
    e.preventDefault();
    this.setState({ isRemovalModalVisible: true });
  }

  closeRemoveAccountModal = () => {
    this.setState({ isRemovalModalVisible: false });
  }

  validateRemoval = () => {
    this.props.onDelete(this.props.user);
    this.closeRemoveAccountModal();
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { user } = this.state;
    const { error } = Joi.validate(user, this.schema, { abortEarly: false });
    if (error) {
      this.setState({ errors: parseError(error) });
    } else {
      const account = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.firstName + ' ' + user.lastName
      };
      // Override user with values defined by authenticated person
      const userToSave = { ...this.props.user, ...account };
      this.props.onSave(userToSave);
      this.setState({ errors: { details: [], fields: {} }, user: {} });
    }
  }

  handleChange = (_, { name, value }) => {
    const { user, errors } = this.state;
    const state = {
      user: { ...user, [name]: value },
      errors: { details: [...errors.details], fields: { ...errors.fields } }
    };
    delete state.errors.fields[name];
    this.setState(state);
  }

  render = () => {
    const { user, submit } = this.props;
    const { fields, details } = this.state.errors;
    const isDisabled = this.isDisabled(user);
    const modalClasses = classNames('ui', { active: this.state.isRemovalModalVisible }, 'small modal');
    return (
      <div id='profile'>
        <Header as='h1'>{this.props.title}</Header>
        <Form error={Boolean(details.length)} onSubmit={this.handleSubmit} warning={isDisabled}>
          <Form.Input required disabled label='Username' defaultValue={user.username}
            type='text' name='username' autoComplete='off' placeholder='Username'
            onChange={this.handleChange}
          />
          <Form.Group widths='equal'>
            <Form.Input required error={fields['firstName']} label='Firstname' defaultValue={user.firstName}
              type='text' name='firstName' autoComplete='off' placeholder='First Name' disabled={isDisabled}
              onChange={this.handleChange}
            />
            <Form.Input required error={fields['lastName']} label='Lastname' defaultValue={user.lastName}
              type='text' name='lastName' autoComplete='off' placeholder='Last Name' disabled={isDisabled}
              onChange={this.handleChange}
            />
          </Form.Group>
          <Form.Input required error={fields['email']} label='Email Address' defaultValue={user.email}
            type='text' name='email' autoComplete='off' placeholder='A valid email address' disabled={isDisabled}
            onChange={this.handleChange}
          />
          <Button fluid color='red' content='Remove your account' loading={user.isDeleting}
            icon='trash' labelPosition='left' tabIndex='0' onClick={this.removeAccount}
          />
          <Message warning content="You can't edit your personal data because it's own by a LDAP provider" />
          {!user.isFetching && user.passwordErrorMessage &&
            <Message error list={[user.passwordErrorMessage]} visible />
          }
          <Message error list={details} />
          <Button className={'button-block submit'} loading={user.isFetching} disabled={isDisabled}>{submit}</Button>
        </Form>
        <Rodal visible={this.state.isRemovalModalVisible}
          onClose={this.closeRemoveAccountModal}>
          <div className={modalClasses}>
            <Icon name='close' onClick={this.closeRemoveAccountModal} />
            <Header icon='trash' content='Remove your account' />
            <Modal.Content>
              <h2>Are you sure to delete your account ?</h2>
              <p>This action is irreversible and you will lose all your data</p>
            </Modal.Content>
            <Modal.Actions>
              <Button content='No' color='black' onClick={this.closeRemoveAccountModal} />
              <Button content='Yes' icon='trash' labelPosition='right' color='teal' onClick={this.validateRemoval} />
            </Modal.Actions>
          </div>
        </Rodal>
      </div>
    );
  }
};

ProfilePane.propTypes = {
  onSave: PropTypes.func,
  onDelete: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  submit: PropTypes.string,
  user: PropTypes.object.isRequired,
  link: PropTypes.string.isRequired
};

export default ProfilePane;

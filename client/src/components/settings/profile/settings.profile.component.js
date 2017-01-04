// React
import React from 'react';
import classNames from 'classnames';
import { Header, Form, Message, Button, Icon, Modal } from 'semantic-ui-react';
import Joi from 'joi-browser';

import Rodal from 'rodal';

import UserConstants from '../../../modules/users/users.constants.js';

// Style
import '../../common/tabform/tabform.component.scss';

// ProfilePane containg fields to edit an existing account
class ProfilePane extends React.Component {

  state = {
    isRemovalModalVisible: false,
    errors: { details: [], fields: {} }
  };

  schema = Joi.object().keys({
    username: Joi.string().trim().alphanum().required().label('Username'),
    email: Joi.string().email().trim().required().label('Email'),
    firstname: Joi.string().trim().required().label('Firstname'),
    lastname: Joi.string().trim().required().label('Lastname')
  })

  isDisabled = (user) => {
    return user.provider !== UserConstants.USER_LOCAL_PROVIDER;
  }

  removeAccount = () => {
    this.setState({ isRemovalModalVisible: true });
  }

  closeRemoveAccountModal = () => {
    this.setState({ isRemovalModalVisible: false });
  }

  validateRemoval = () => {
    this.props.onDelete(this.props.user);
    this.closeRemoveAccountModal();
  }

  handleSubmit = (e, { formData }) => {
    e.preventDefault();
    const { error } = Joi.validate(formData, this.schema, { abortEarly: false });
    if (error) {
      const fields = {};
      const details = [];
      error.details.forEach(err => {
        fields[err.path] = true;
        details.push(err.message);
      });
      this.setState({ errors: { fields, details } });
    } else {
      const account = {
        email: formData.email,
        firstname: formData.firstname,
        lastname: formData.lastname,
        displayName: formData.firstname + ' ' + formData.lastname
      };
      // Override user with values defined by authenticated person
      const userToSave = { ...this.props.user, ...account };
      this.props.onSave(userToSave);
      this.setState({ errors: { details: [], fields: {} } });
    }
  }

  render = () => {
    const { user, submit } = this.props;
    const { fields, details } = this.state.errors;
    const isDisabled = this.isDisabled(user);
    const modalClasses = classNames(
      'ui',
      { active: this.state.isRemovalModalVisible },
      'small modal'
    );
    return (
      <div id='profile'>
        <Header as='h1'>{this.props.title}</Header>
        <Form error={!!details.length} onSubmit={this.handleSubmit} warning={isDisabled}>
          <Form.Input required disabled label='Username' defaultValue={user.username}
              type='text' name='username' autoComplete='off' placeholder='Username'
            />
          <Form.Group widths='equal'>
            <Form.Input required error={fields['firstname']} label='Firstname' defaultValue={user.firstName}
              type='text' name='firstname' autoComplete='off' placeholder='First Name' disabled={isDisabled}
            />
            <Form.Input required error={fields['lastname']} label='Lastname' defaultValue={user.lastName}
              type='text' name='lastname' autoComplete='off' placeholder='Last Name' disabled={isDisabled}
            />
          </Form.Group>
          <Form.Input required error={fields['email']} label='Email Address' defaultValue={user.email}
              type='text' name='email' autoComplete='off' placeholder='A valid email address' disabled={isDisabled}
          />
          <Button fluid color='red' content='Remove your account' loading={user.isDeleting}
            icon='trash' labelPosition='left' tabIndex='0' onClick={this.removeAccount}
          />
          <Message warning content="You can't edit your personal data because it's own by a LDAP provider" />
          {!user.isFetching && user.passwordErrorMessage &&
            <Message error list={[user.passwordErrorMessage]} visible/>
          }
          <Message error list={details}/>
          <Button className={'button-block submit'} loading={user.isFetching} disabled={isDisabled}>{submit}</Button>
        </Form>
        <Rodal visible={this.state.isRemovalModalVisible}
            onClose={this.closeRemoveAccountModal}>
          <div className={modalClasses}>
            <i className='close icon' onClick={this.closeRemoveAccountModal} />
            <div className='header'><i className='large trash icon' /> Remove your account</div>
            <div className='content'>
              <h2>Are you sure to delete your account ?</h2>
              <p>This action is irreversible and you will lose all your data</p>
            </div>
            <div className='actions'>
              <div className='ui black button' onClick={this.closeRemoveAccountModal}>
                No
              </div>
              <div className='ui teal right labeled icon button' onClick={this.validateRemoval}>
                Yes
                <i className='trash icon' />
              </div>
            </div>
          </div>
        </Rodal>
      </div>
    );
  }
};

ProfilePane.propTypes = {
  onSave: React.PropTypes.func,
  onDelete: React.PropTypes.func.isRequired,
  label: React.PropTypes.string.isRequired,
  title: React.PropTypes.string.isRequired,
  submit: React.PropTypes.string,
  user: React.PropTypes.object.isRequired,
  link: React.PropTypes.string.isRequired
};

export default ProfilePane;

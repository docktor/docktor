// React
import React from 'react';
import classNames from 'classnames';
import { Header, Form, Message, Button } from 'semantic-ui-react';
import Joi from 'joi-browser';

import UserConstants from '../../../modules/users/users.constants.js';

// Style
import '../../common/tabform/tabform.component.scss';

// ChangePasswordPane containg fields to change password
class ChangePasswordPane extends React.Component {

  state = { errors: { details: [], fields: {} } }

  schema = Joi.object().keys({
    oldPassword: Joi.string().trim().required().label('Old Password'),
    newPassword: Joi.string().trim().min(6).required().label('New Password'),
  })

  isDisabled = (user) => {
    return user.provider !== UserConstants.USER_LOCAL_PROVIDER;
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
        id: this.props.user.id,
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      };
      this.props.onChangePassword(account);
      this.setState({ errors: { details: [], fields: {} } });
    }
  }

  render = () => {
    const { user, submit } = this.props;
    const { fields, details } = this.state.errors;
    const isDisabled = this.isDisabled(user);
    return (
      <div id='change-password'>
        <Header as='h1'>{this.props.title}</Header>
        <Form error={!!details.length} onSubmit={this.handleSubmit} warning={isDisabled}>
          <Form.Input required
            error={fields['oldPassword']} label='Old Password' type='password'
            name='oldPassword' autoComplete='off' placeholder='Your old password'
            disabled={isDisabled}
          />
          <Form.Input required
            error={fields['newPassword']} label='New Password' type='password'
            name='newPassword' autoComplete='off' placeholder='Your new password'
            disabled={isDisabled}
          />
          <Message warning content="You can't change your password here because your user comes from a LDAP provider" />
          {!user.isFetching && user.passwordErrorMessage &&
            <Message error list={[user.passwordErrorMessage]} visible/>
          }
          <Message error list={details}/>
          <Button className={'button-block submit'} loading={user.isFetching} disabled={isDisabled}>{submit}</Button>
        </Form>
      </div>
    );
  }
};

ChangePasswordPane.propTypes = {
  onChangePassword: React.PropTypes.func,
  label: React.PropTypes.string.isRequired,
  title: React.PropTypes.string.isRequired,
  submit: React.PropTypes.string,
  link: React.PropTypes.string.isRequired,
  user: React.PropTypes.object.isRequired
};

export default ChangePasswordPane;

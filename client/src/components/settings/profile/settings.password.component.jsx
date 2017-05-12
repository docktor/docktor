// React
import React from 'react';
import PropTypes from 'prop-types';
import { Header, Form, Message, Button } from 'semantic-ui-react';
import Joi from 'joi-browser';

import UserConstants from '../../../modules/users/users.constants';
import { parseError } from '../../../modules/utils/forms';


// Style
import '../../common/tabform/tabform.component.scss';

// ChangePasswordPane containg fields to change password
class ChangePasswordPane extends React.Component {

  state = { errors: { details: [], fields: {} }, auth: {} }

  schema = Joi.object().keys({
    oldPassword: Joi.string().trim().required().label('Old Password'),
    newPassword: Joi.string().trim().min(6).required().label('New Password'),
  })

  isDisabled = (user) => {
    return user.provider !== UserConstants.USER_LOCAL_PROVIDER;
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { auth } = this.state;
    const { error } = Joi.validate(auth, this.schema, { abortEarly: false });
    if (error) {
      this.setState({ errors: parseError(error) });
    } else {
      const account = {
        id: this.props.user.id,
        oldPassword: auth.oldPassword,
        newPassword: auth.newPassword
      };
      this.props.onChangePassword(account);
      this.setState({ errors: { details: [], fields: {} }, auth: {} });
    }
  }

  handleChange = (e, { name, value }) => {
    const { auth, errors } = this.state;
    const state = {
      auth: { ...auth, [name]: value },
      errors: { details: [...errors.details], fields: { ...errors.fields } }
    };
    delete state.errors.fields[name];
    this.setState(state);
  }

  render = () => {
    const { user, submit } = this.props;
    const { fields, details } = this.state.errors;
    const isDisabled = this.isDisabled(user);
    return (
      <div id='change-password'>
        <Header as='h1'>{this.props.title}</Header>
        <Form error={Boolean(details.length)} onSubmit={this.handleSubmit} warning={isDisabled}>
          <Form.Input required
            error={fields['oldPassword']} label='Old Password' type='password'
            name='oldPassword' autoComplete='off' placeholder='Your old password'
            disabled={isDisabled} onChange={this.handleChange}
          />
          <Form.Input required
            error={fields['newPassword']} label='New Password' type='password'
            name='newPassword' autoComplete='off' placeholder='Your new password'
            disabled={isDisabled} onChange={this.handleChange}
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
  onChangePassword: PropTypes.func,
  label: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  submit: PropTypes.string,
  link: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired
};

export default ChangePasswordPane;

// React
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Header, Form, Message, Button } from 'semantic-ui-react';
import Joi from 'joi-browser';

import TabForm from '../common/tabform/tabform.component';
import AuthThunks from '../../modules/auth/auth.thunk';
import { parseError } from '../../modules/utils/forms';

class ResetPwdComponent extends React.Component {

  state = { errors: { details: [], fields: {} }, auth: {} }

  schema = Joi.object().keys({
    username: Joi.string().trim().alphanum().required().label('Username')
  })

  componentWillMount = () => {
    const errorMessage = this.props.errorMessage;
    if (errorMessage) {
      this.setState({ errors: { details: [errorMessage], fields: {} }, auth: {} });
    }
  }

  componentWillReceiveProps = (nextProps) => {
    const errorMessage = nextProps.errorMessage;
    if (errorMessage) {
      this.setState({ errors: { details: [errorMessage], fields: {} }, auth: {} });
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { auth } = this.state;
    const { error } = Joi.validate(auth, this.schema, { abortEarly: false });
    if (error) {
      this.setState({ errors: parseError(error) });
    } else {
      this.props.resetPassword(auth.username);
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
    const { isFetching } = this.props;
    const { fields, details } = this.state.errors;
    return (
      <div id='reset-password'>
        <Header as='h1'>Reset your password</Header>
        <Form error={Boolean(details.length)} onSubmit={this.handleSubmit}>
          <Form.Input required error={fields['username']} label='Username' onChange={this.handleChange}
            type='text' name='username' autoComplete='off' placeholder='Username of user with forgotten password'
          />
          <Message error list={details} />
          <Button className={'button-block submit'} loading={isFetching}>Reset it!</Button>
        </Form>
      </div>
    );
  }
}

ResetPwdComponent.propTypes = {
  resetPassword: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  isFetching: PropTypes.bool.isRequired,
  isAuthenticated: PropTypes.bool
};

class ResetPasswordP extends React.Component {

  componentWillMount = () => {
    if (this.props.isAuthenticated && !this.props.errorMessage) {
      this.props.redirect('/');
    }
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.isAuthenticated && !nextProps.errorMessage) {
      this.props.redirect('/');
    }
  }

  render = () => {
    const { errorMessage, isFetching } = this.props;
    return (
      <TabForm>
        <ResetPwdComponent errorMessage={errorMessage} resetPassword={this.props.resetPassword} isFetching={isFetching} />
      </TabForm>
    );
  }
};

ResetPasswordP.propTypes = {
  resetPassword: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  isAuthenticated: PropTypes.bool,
  redirect: PropTypes.func
};

// Function to map state to container props
const mapStateToProps = (state) => {
  const auth = state.auth;
  return {
    isFetching: auth.isFetching,
    errorMessage: auth.errorMessage,
    isAuthenticated: auth.isAuthenticated
  };
};

// Function to map dispatch to container props
const mapDispatchToProps = (dispatch) => {
  return {
    resetPassword: (username) => {
      dispatch(AuthThunks.resetPassword(username));
    },
    redirect: (path) => {
      dispatch(push(path));
    }
  };
};

// Redux container to reset password component
const ResetPassword = connect(
  mapStateToProps,
  mapDispatchToProps
)(ResetPasswordP);

export default ResetPassword;

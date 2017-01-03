// React
import React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Header, Form, Message, Button, Input } from 'semantic-ui-react';

import TabForm from '../common/tabform/tabform.component.js';
import AuthThunks from '../../modules/auth/auth.thunk.js';

class ResetPwdComponent extends React.Component {

  state = {
    schema: Joi.object().keys({
      username: Joi.string().required()
    })
  }

  componentWillReceiveProps(nextProps) {
    const errorMessage = nextProps.errorMessage;
    if (errorMessage) {
      this.setState({ errors: [{ path:'error', message: errorMessage }] });
    }
  }

  componentWillMount() {
    const errorMessage = this.props.errorMessage;
    if (errorMessage) {
      this.setState({ errors: [{ path:'error', message: errorMessage }] });
    }
  }

  handleSubmit = (e, { formData }) => {
    e.preventDefault();
    const { error } = Joi.validate(formData, this.state.schema, { abortEarly: false });
    if (error) {
      this.setState({ errors:error.details });
    } else {
      this.props.resetPassword(formData.username);
    }
  }

  render() {
    const { errorMessage, isFetching } = this.props;
    const { errors } = this.state;
    return (
        <div id='reset-password'>
          <Header as='h1'>Reset your password</Header>
          <Form error={!!errors} onSubmit={this.handleSubmit}>
            <Form.Input required label='Username' type='text' name='username' autoComplete='off' placeholder='Username of user with forgotten password'/>
            <Message error>
              <Message.List>
                {errors && errors.map(error => <Message.Item key={error.path}>{error.message}</Message.Item>)}
              </Message.List>
            </Message>
            <Button className={'ui button button-block submit' + (isFetching ? ' loading' : '')}>Reset it!</Button>
          </Form>
        </div>

    );
  }
}

ResetPwdComponent.propTypes = {
  resetPassword: React.PropTypes.func.isRequired,
  errorMessage: React.PropTypes.string,
  isFetching: React.PropTypes.bool.isRequired,
  isAuthenticated: React.PropTypes.bool.isRequired
};

class ResetPasswordP extends React.Component {

  componentWillReceiveProps(nextProps) {
    if(nextProps.isAuthenticated && !nextProps.errorMessage) {
      this.props.redirect('/');
    }
  }

  componentWillMount() {
    if(this.props.isAuthenticated && !this.props.errorMessage) {
      this.props.redirect('/');
    }
  }

  render() {
    const { errorMessage, isFetching } = this.props;
    return (
      <TabForm>
        <ResetPwdComponent errorMessage={errorMessage} resetPassword={this.props.resetPassword} isFetching={isFetching}/>
      </TabForm>
    );
  }
};

ResetPasswordP.propTypes = {
  resetPassword: React.PropTypes.func.isRequired,
  isFetching: React.PropTypes.bool.isRequired,
  errorMessage: React.PropTypes.string,
  isAuthenticated: React.PropTypes.bool.isRequired,
  redirect: React.PropTypes.func
};

// Function to map state to container props
const mapStateToProps = (state, ownProps) => {
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
    redirect : (path) => {
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

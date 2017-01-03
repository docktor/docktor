// React
import React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Header, Form, Message, Button, Input } from 'semantic-ui-react';

import TabForm from '../common/tabform/tabform.component.js';
import AuthThunks from '../../modules/auth/auth.thunk.js';

class ChangeResetPasswordP extends React.Component {

  state = {
    schema: Joi.object().keys({
      newPassword: Joi.string().min(6).required()
    })
  }

  componentWillReceiveProps(nextProps) {
    const errorMessage = nextProps.errorMessage;
    if(nextProps.isAuthenticated && !errorMessage) {
      this.props.redirect('/');
    }
    if (errorMessage) {
      this.setState({ errors: [{ path:'error', message: errorMessage }] });
    }
  }

  componentWillMount() {
    const errorMessage = this.props.errorMessage;
    if(this.props.isAuthenticated && !errorMessage) {
      this.props.redirect('/');
    }
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
      const token = this.props.token.trim();
      this.props.changePassword(formData.newPassword, token);
    }
  }

  render() {
    const { errorMessage, isFetching, token } = this.props;
    const { errors } = this.state;
    if (token) {
      return (
        <TabForm>
          <div id='change-password'>
            <Header as='h1'>Set a new password</Header>
            <Form error={!!errors} onSubmit={this.handleSubmit}>
              <Form.Input required label='New Password' type='password' name='newPassword' autoComplete='off' placeholder='Set a new password'/>
              <Message error>
                <Message.List>
                  {errors && errors.map(error => <Message.Item key={error.path}>{error.message}</Message.Item>)}
                </Message.List>
              </Message>
              <Button className={'ui button button-block submit' + (isFetching ? ' loading' : '')}>Change password</Button>
            </Form>
          </div>
        </TabForm>
      );
    } else {
      return (
        <div>Token is empty, cannot change password</div>
      );
    }
  }
};

ChangeResetPasswordP.propTypes = {
  token: React.PropTypes.string,
  changePassword: React.PropTypes.func.isRequired,
  isFetching: React.PropTypes.bool.isRequired,
  errorMessage: React.PropTypes.string,
  redirect: React.PropTypes.func,
  isAuthenticated: React.PropTypes.bool.isRequired
};

// Function to map state to container props
const mapStateToProps = (state, ownProps) => {

  const token = ownProps.location.query.token;
  const auth = state.auth;

  return {
    token,
    errorMessage: auth.errorMessage,
    isFetching: auth.isFetching,
    isAuthenticated: auth.isAuthenticated
  };
};

// Function to map dispatch to container props
const mapDispatchToProps = (dispatch) => {
  return {
    changePassword: (password, token) => {
      dispatch(AuthThunks.changePasswordAfterReset(password, token));
    },
    redirect : (path) => {
      dispatch(push(path));
    }
  };
};

// Redux container to reset password component
const ChangeResetPassword = connect(
  mapStateToProps,
  mapDispatchToProps
)(ChangeResetPasswordP);

export default ChangeResetPassword;

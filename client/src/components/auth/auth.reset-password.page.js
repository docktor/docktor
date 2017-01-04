// React
import React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Header, Form, Message, Button } from 'semantic-ui-react';
import Joi from 'joi-browser';

import TabForm from '../common/tabform/tabform.component.js';
import AuthThunks from '../../modules/auth/auth.thunk.js';
import { parseError } from '../../modules/utils/forms.js';

class ResetPwdComponent extends React.Component {

  state = { errors: { details: [], fields: {} } }

  schema = Joi.object().keys({
    username: Joi.string().trim().alphanum().required().label('Username')
  })

  componentWillMount = () => {
    const errorMessage = this.props.errorMessage;
    if (errorMessage) {
      this.setState({ errors: { details: [errorMessage], fields:{} } });
    }
  }

  componentWillReceiveProps = (nextProps) => {
    const errorMessage = nextProps.errorMessage;
    if (errorMessage) {
      this.setState({ errors: { details: [errorMessage], fields:{} } });
    }
  }

  handleSubmit = (e, { formData }) => {
    e.preventDefault();
    const { error } = Joi.validate(formData, this.schema, { abortEarly: false });
    if (error) {
      this.setState({ errors: parseError(error) });
    } else {
      this.props.resetPassword(formData.username);
    }
  }

  render = () => {
    const { isFetching } = this.props;
    const { fields, details } = this.state.errors;
    return (
      <div id='reset-password'>
        <Header as='h1'>Reset your password</Header>
        <Form error={!!details.length} onSubmit={this.handleSubmit}>
          <Form.Input required error={fields['username']} label='Username'
            type='text' name='username' autoComplete='off' placeholder='Username of user with forgotten password'
          />
          <Message error list={details}/>
          <Button className={'button-block submit'} loading={isFetching}>Reset it!</Button>
        </Form>
      </div>
    );
  }
}

ResetPwdComponent.propTypes = {
  resetPassword: React.PropTypes.func.isRequired,
  errorMessage: React.PropTypes.string,
  isFetching: React.PropTypes.bool.isRequired,
  isAuthenticated: React.PropTypes.bool
};

class ResetPasswordP extends React.Component {

  componentWillMount = () => {
    if(this.props.isAuthenticated && !this.props.errorMessage) {
      this.props.redirect('/');
    }
  }

  componentWillReceiveProps = (nextProps) => {
    if(nextProps.isAuthenticated && !nextProps.errorMessage) {
      this.props.redirect('/');
    }
  }

  render = () => {
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
  isAuthenticated: React.PropTypes.bool,
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

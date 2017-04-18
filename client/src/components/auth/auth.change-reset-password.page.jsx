// React
import React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Header, Form, Message, Button } from 'semantic-ui-react';
import Joi from 'joi-browser';

import TabForm from '../common/tabform/tabform.component';
import AuthThunks from '../../modules/auth/auth.thunk';
import { parseError } from '../../modules/utils/forms';

class ChangeResetPasswordP extends React.Component {

  state = { errors: { details: [], fields: {} } }

  schema = Joi.object().keys({
    newPassword: Joi.string().trim().min(6).required().label('New Password')
  })

  componentWillMount = () => {
    const errorMessage = this.props.errorMessage;
    if(this.props.isAuthenticated && !errorMessage) {
      this.props.redirect('/');
    }
    if (errorMessage) {
      this.setState({ errors: { details: [errorMessage], fields:{} } });
    }
  }

  componentWillReceiveProps = (nextProps) => {
    const errorMessage = nextProps.errorMessage;
    if(nextProps.isAuthenticated && !errorMessage) {
      this.props.redirect('/');
    }
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
      const token = this.props.token.trim();
      this.props.changePassword(formData.newPassword, token);
    }
  }

  render = () => {
    const { isFetching, token } = this.props;
    const { fields, details } = this.state.errors;
    if (token) {
      return (
        <TabForm>
          <div id='change-password'>
            <Header as='h1'>Set a new password</Header>
            <Form error={Boolean(details.length)} onSubmit={this.handleSubmit}>
              <Form.Input required error={fields['newPassword']} label='New Password'
                type='password' name='newPassword' autoComplete='off' placeholder='Set a new password'
              />
              <Message error list={details}/>
              <Button className={'button-block submit'} loading={isFetching}>Change password</Button>
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

// React
import React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import TabForm from '../common/tabform/tabform.component.js';
import AuthThunks from '../../modules/auth/auth.thunk.js';

class ResetPwdComponent extends React.Component {

  componentDidMount() {
    $('#reset-password > .ui.form')
      .form({
        fields: {
          username : ['empty', 'doesntContain[ ]']
        },
        onSuccess: (event, fields) => {
          this.onResetPassword(event);
        },
        onFailure: (event, fields) => {
          return false;
        }
      })
    ;
  }

  onResetPassword(event) {
    event.preventDefault();
    const username = this.refs.username.value.trim();
    this.props.resetPassword(username);
  }

  render() {
    const { errorMessage, isFetching } = this.props;
    return (
        <div id='reset-password'>
          <h1>Reset your password</h1>
          <form className='ui form' >
            <div className='required field'>
              <label>
                Username
              </label>
              <input type='text' ref='username' name='username' placeholder='Username of user with forgotten password' autoComplete='off'/>
            </div>
            {errorMessage &&
                <p className='error api'>{errorMessage}</p>
            }
            <div className='ui error message' />
            <button type='submit' className={'ui button button-block submit' + (isFetching ? ' loading' : '')}>Reset it!</button>
          </form>
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

// React
import React from 'react';
import { connect } from 'react-redux';

import { push } from 'react-router-redux';

import TabForm from '../common/tabform.component.js';
import AuthThunks from './auth.thunk.js';

class ChangeResetPasswordP extends React.Component {

  componentDidMount() {
    $('#change-password > .ui.form').form({
      fields: {
        newPassword : ['minLength[6]', 'empty', 'doesntContain[ ]']
      },
      onSuccess: (event, fields) => {
        this.onChangePassword(event);
      },
      onFailure: (event, fields) => {
        return false;
      }
    });
  }

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

  onChangePassword(event) {
      event.preventDefault();
      const newPassword = this.refs.newPassword.value.trim();
      const token = this.props.token.trim();
      this.props.changePassword(newPassword, token);
  }

  render() {
    const { errorMessage, isFetching, token } = this.props;
    if (token) {
      return (
        <TabForm>
          <div id='change-password'>
              <h1>Set a new password</h1>
              <form className='ui form' >
                <div className='required field'>
                  <label>
                    New password
                  </label>
                  <input type='password' ref='newPassword' name='newPassword'  placeholder='Set a new password' autoComplete='off'/>
                </div>
                {errorMessage &&
                    <p className='error api'>{errorMessage}</p>
                }
                <div className='ui error message'></div>
                <button type='submit' className={'ui button button-block submit' + (isFetching ? ' loading' : '')}>Change password</button>
              </form>
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

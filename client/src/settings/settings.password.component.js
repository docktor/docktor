// React
import React from 'react';
import classNames from 'classnames';

// Style
import '../common/tabform.component.scss';

// ChangePasswordPane containg fields to change password
class ChangePasswordPane extends React.Component {

  componentDidMount() {
    $('#change-password > .ui.form')
      .form({
        fields: {
          oldPassword: ['empty'],
          newPassword : ['minLength[6]', 'empty', 'doesntContain[ ]']
        },
        onSuccess: (event, fields) => {
          this.handleClick(event);
        },
        onFailure: (event, fields) => {
          return false;
        }
      })
    ;
  }

  render() {
    const { errorMessage, isFetching } = this.props;
    return (
      <div id='change-password'>
        <h1>{this.props.title}</h1>
         <form className='ui form' >
            <div className='required field'>
              <label>
                Old password
              </label>
              <input type='password' ref='oldPassword' name='oldPassword' placeholder='Your old password' autoComplete='off'/>
            </div>
          <div className='required field'>
            <label>
              New password
            </label>
            <input type='password' ref='newPassword' name='newPassword' placeholder='Your new password' autoComplete='off'/>
          </div>
          {errorMessage &&
              <p className='error api'>{errorMessage}</p>
          }
          <div className='ui error message'></div>
          <button type='submit' className={'ui button button-block' + (isFetching ? ' loading' : '')}>{this.props.submit}</button>
        </form>
      </div>
    );
  }
  handleClick(event) {
      event.preventDefault();
      const oldPassword = this.refs.oldPassword;
      const newPassord = this.refs.newPassword;
      const account = {
        oldPassword: oldPassword.value.trim(),
        newPassord: newPassord.value.trim()
      };
      this.props.onSaveClick(account);
  }
};

ChangePasswordPane.propTypes = {
  onSaveClick: React.PropTypes.func,
  errorMessage: React.PropTypes.string,
  label: React.PropTypes.string.isRequired,
  title: React.PropTypes.string.isRequired,
  submit: React.PropTypes.string,
  isFetching: React.PropTypes.bool.isRequired,
  link: React.PropTypes.string.isRequired
};

export default ChangePasswordPane;

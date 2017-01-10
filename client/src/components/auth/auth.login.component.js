// React
import React from 'react';
import { Link } from 'react-router';
import { Header, Form, Message, Button } from 'semantic-ui-react';
import Joi from 'joi-browser';

import { parseError } from '../../modules/utils/forms.js';

// Style
import '../common/tabform/tabform.component.scss';

// Signin Pane containing fields to log in the application
class SigninPane extends React.Component {

  state = { errors: { details: [], fields: {} } }

  schema = Joi.object().keys({
    username: Joi.string().trim().alphanum().required().label('Username'),
    password: Joi.string().trim().min(6).required().label('Password')
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
      this.props.onLoginClick(formData);
    }
  }

  render = () => {
    const { isFetching, submit } = this.props;
    const { fields, details } = this.state.errors;
    return (
      <div id='login'>
        <Header as='h1'>{this.props.title}</Header>
        <Form error={Boolean(details.length)} onSubmit={this.handleSubmit}>
          <Form.Input required error={fields['username']} label='Username'
            type='text' name='username' autoComplete='off' placeholder='Registered/LDAP username'
          />
          <Form.Input required error={fields['password']} label='Password'
            type='password' name='password' autoComplete='off' placeholder='Password'
          />
          <Message error list={details}/>
          <p className='forgot'><Link to='/reset_password'>Forgot Password?</Link></p>
          <Button className={'button-block submit'} loading={isFetching}>{submit}</Button>
        </Form>
      </div>
    );
  }
};

SigninPane.propTypes = {
  onLoginClick: React.PropTypes.func.isRequired,
  errorMessage: React.PropTypes.string,
  title: React.PropTypes.string.isRequired,
  submit: React.PropTypes.string.isRequired,
  isFetching: React.PropTypes.bool.isRequired
};

export default SigninPane;

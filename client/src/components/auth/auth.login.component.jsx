// React
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Header, Form, Message, Button } from 'semantic-ui-react';
import Joi from 'joi-browser';

import { parseError } from '../../modules/utils/forms';

// Style
import '../common/tabform/tabform.component.scss';

// Signin Pane containing fields to log in the application
class SigninPane extends React.Component {

  state = { errors: { details: [], fields: {} }, auth: {} }

  schema = Joi.object().keys({
    username: Joi.string().trim().alphanum().required().label('Username'),
    password: Joi.string().trim().min(6).required().label('Password')
  })

  componentWillMount = () => {
    const errorMessage = this.props.errorMessage;
    if (errorMessage) {
      this.setState({ errors: { details: [errorMessage], fields:{} }, auth: {} });
    }
  }

  componentWillReceiveProps = (nextProps) => {
    const errorMessage = nextProps.errorMessage;
    if (errorMessage) {
      this.setState({ errors: { details: [errorMessage], fields:{} }, auth: {} });
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { auth } = this.state;
    const { error } = Joi.validate(auth, this.schema, { abortEarly: false });
    if (error) {
      this.setState({ errors: parseError(error) });
    } else {
      this.props.onLoginClick(auth);
    }
  }

  handleChange = (_, { name, value }) => {
    const { auth, errors } = this.state;
    const state = {
      auth: { ...auth, [name]: value },
      errors: { details: [...errors.details], fields: { ...errors.fields } }
    };
    delete state.errors.fields[name];
    this.setState(state);
  }

  render = () => {
    const { isFetching, submit } = this.props;
    const { fields, details } = this.state.errors;
    return (
      <div id='login'>
        <Header as='h1'>{this.props.title}</Header>
        <Form error={Boolean(details.length)} onSubmit={this.handleSubmit}>
          <Form.Input required error={fields['username']} label='Username' onChange={this.handleChange}
            type='text' name='username' autoComplete='off' placeholder='Registered/LDAP username'
          />
          <Form.Input required error={fields['password']} label='Password' onChange={this.handleChange}
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
  onLoginClick: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  title: PropTypes.string.isRequired,
  submit: PropTypes.string.isRequired,
  isFetching: PropTypes.bool.isRequired
};

export default SigninPane;

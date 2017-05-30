// React
import React from 'react';
import PropTypes from 'prop-types';
import { Header, Form, Message, Button } from 'semantic-ui-react';
import Joi from 'joi-browser';

import { parseError } from '../../modules/utils/forms';

// Style
import '../common/tabform/tabform.component.scss';

// Register Pane containg fields to create an account
class RegisterPane extends React.Component {

  state = { errors: { details: [], fields: {} }, auth: {} }

  schema = Joi.object().keys({
    username: Joi.string().trim().alphanum().required().label('Username'),
    password: Joi.string().trim().min(6).required().label('Password'),
    email: Joi.string().email().trim().required().label('Email'),
    firstname: Joi.string().trim().required().label('Firstname'),
    lastname: Joi.string().trim().required().label('Lastname'),
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
      this.props.onRegisterClick(auth);
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
      <div id='register'>
        <Header as='h1'>{this.props.title}</Header>
        <Form error={Boolean(details.length)} onSubmit={this.handleSubmit}>
          <Form.Group widths='equal'>
            <Form.Input required error={fields['username']} label='Username' onChange={this.handleChange}
              type='text' name='username' autoComplete='off' placeholder='A unique username'
            />
            <Form.Input required error={fields['password']} label='Password' onChange={this.handleChange}
              type='password' name='password' autoComplete='off' placeholder='Set a password'
            />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Input required error={fields['firstname']} label='First Name' onChange={this.handleChange}
              type='text' name='firstname' autoComplete='off' placeholder='First Name'
            />
            <Form.Input required error={fields['lastname']} label='Last Name' onChange={this.handleChange}
              type='text' name='lastname' autoComplete='off' placeholder='Last Name'
            />
          </Form.Group>
          <Form.Input required error={fields['email']} label='Email' onChange={this.handleChange}
            type='text' name='email' autoComplete='off' placeholder='A valid email address'
          />
          <Message error list={details}/>
          <Button className={'button-block submit'} loading={isFetching}>{submit}</Button>
        </Form>
      </div>
    );
  }
};

RegisterPane.propTypes = {
  onRegisterClick: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  label: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  submit: PropTypes.string.isRequired,
  isFetching: PropTypes.bool.isRequired,
  link: PropTypes.string.isRequired
};

export default RegisterPane;

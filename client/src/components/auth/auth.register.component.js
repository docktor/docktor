// React
import React from 'react';
import classNames from 'classnames';
import { Header, Form, Message, Button, Input } from 'semantic-ui-react';
import { isEmpty } from '../../modules/utils/objects.js';
import Joi from 'joi-browser';

// Style
import '../common/tabform/tabform.component.scss';

// Register Pane containg fields to create an account
class RegisterPane extends React.Component {

  state = {
    errors: {}
  }

  schema = Joi.object().keys({
    username: Joi.string().trim().alphanum().required(),
    password: Joi.string().trim().regex(/^[\s]+$/, { name: 'whitespaces', invert: true }).min(6).required(),
    email: Joi.string().email().trim().required(),
    firstname: Joi.string().trim().required(),
    lastname: Joi.string().trim().required(),
  })

  componentWillMount() {
    const errorMessage = this.props.errorMessage;
    if (errorMessage) {
      this.setState({ errors: { error: errorMessage } });
    }
  }

  componentWillReceiveProps(nextProps) {
    const errorMessage = this.props.errorMessage;
    if (errorMessage) {
      this.setState({ errors: { error: errorMessage } });
    }
  }

  handleSubmit = (e, { formData }) => {
    e.preventDefault();
    const { error } = Joi.validate(formData, this.schema, { abortEarly: false });
    if (error) {
      const errors = {};
      error.details.forEach(err => errors[err.path] = err.message);
      this.setState({ errors });
    } else {
      this.props.onRegisterClick(formData);
    }
  }

  render() {
    const { errorMessage, isFetching, submit } = this.props;
    const { errors } = this.state;
    return (
      <div id='register'>
        <Header as='h1'>{this.props.title}</Header>
        <Form error={!isEmpty(errors)} onSubmit={this.handleSubmit}>
          <Form.Group widths='equal'>
            <Form.Input required error={!!errors['username']} label='Username' type='text' name='username' autoComplete='off' placeholder='A unique username'/>
            <Form.Input required error={!!errors['password']} label='Password' type='password' name='password' autoComplete='off' placeholder='Set a password'/>
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Input required error={!!errors['firstname']} label='First Name' type='text' name='firstname' autoComplete='off' placeholder='First Name'/>
            <Form.Input required error={!!errors['lastname']} label='Last Name' type='text' name='lastname' autoComplete='off' placeholder='Last Name'/>
          </Form.Group>
          <Form.Input required error={!!errors['email']} label='Email' type='text' name='email' autoComplete='off' placeholder='A valid email address'/>
          <Message error>
            <Message.List>
              {errors && Object.keys(errors).map(error => <Message.Item key={error}>{errors[error]}</Message.Item>)}
            </Message.List>
          </Message>
          <Button className={'ui button button-block submit' + (isFetching ? ' loading' : '')}>{submit}</Button>
        </Form>
      </div>
    );
  }
};

RegisterPane.propTypes = {
  onRegisterClick: React.PropTypes.func.isRequired,
  errorMessage: React.PropTypes.string,
  label: React.PropTypes.string.isRequired,
  title: React.PropTypes.string.isRequired,
  submit: React.PropTypes.string.isRequired,
  isFetching: React.PropTypes.bool.isRequired,
  link: React.PropTypes.string.isRequired
};

export default RegisterPane;

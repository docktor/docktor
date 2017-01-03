// React
import React from 'react';
import classNames from 'classnames';
import { Header, Form, Message, Button, Input } from 'semantic-ui-react';
import Joi from 'joi-browser';

// Style
import '../common/tabform/tabform.component.scss';

// Register Pane containg fields to create an account
class RegisterPane extends React.Component {

  state = {
    schema: Joi.object().keys({
      username: Joi.string().required(),
      password: Joi.string().min(6).required(),
      email: Joi.string().email().required(),
      firstname: Joi.string().required(),
      lastname: Joi.string().required(),
    })
  }

  handleSubmit = (e, { formData }) => {
    e.preventDefault();
    const { error } = Joi.validate(formData, this.state.schema, { abortEarly: false });
    if (error) {
      this.setState({ errors:error.details });
    } else {
      this.props.onRegisterClick(formData);
    }
  }

  componentWillMount() {
    const errorMessage = this.props.errorMessage;
    if (errorMessage) {
      this.setState({ errors: [{ path:'error', message: errorMessage }] });
    }
  }

  componentWillReceiveProps(nextProps) {
    const errorMessage = nextProps.errorMessage;
    if (errorMessage) {
      this.setState({ errors: [{ path:'error', message: errorMessage }] });
    }
  }

  render() {
    const { errorMessage, isFetching, submit } = this.props;
    const { errors } = this.state;
    return (
      <div id='register'>
        <Header as='h1'>{this.props.title}</Header>
        <Form error={!!errors} onSubmit={this.handleSubmit}>
          <Form.Group widths='equal'>
            <Form.Input required label='Username' type='text' name='username' autoComplete='off' placeholder='A unique username'/>
            <Form.Input required label='Password' type='password' name='password' autoComplete='off' placeholder='Set a password'/>
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Input required label='First Name' type='text' name='firstname' autoComplete='off' placeholder='First Name'/>
            <Form.Input required label='Last Name' type='text' name='lastname' autoComplete='off' placeholder='Last Name'/>
          </Form.Group>
          <Form.Input required label='Email' type='text' name='email' autoComplete='off' placeholder='A valid email address'/>
          <Message error>
            <Message.List>
              {errors && errors.map(error => <Message.Item key={error.path}>{error.message}</Message.Item>)}
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

// React
import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router';
import { Header, Form, Message, Button, Input } from 'semantic-ui-react';
import Joi from 'joi-browser';

// Style
import '../common/tabform/tabform.component.scss';

// Signin Pane containing fields to log in the application
class SigninPane extends React.Component {

  state = {
    schema: Joi.object().keys({
      username: Joi.string().required(),
      password: Joi.string().required(),
    })
  }

  handleSubmit = (e, { formData }) => {
    e.preventDefault();
    const { error } = Joi.validate(formData, this.state.schema, { abortEarly: false });
    if (error) {
      this.setState({ errors:error.details });
    } else {
      this.props.onLoginClick(formData);
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
    const { isFetching, submit } = this.props;
    const { errors } = this.state;
    return (
      <div id='login'>
        <Header as='h1'>{this.props.title}</Header>
        <Form error={!!errors} onSubmit={this.handleSubmit}>
          <Form.Input required label='Username' type='text' name='username' autoComplete='off' placeholder='Registered/LDAP username'/>
          <Form.Input required label='Password' type='password' name='password' autoComplete='off' placeholder='Password'/>
          <Message error>
            <Message.List>
              {errors && errors.map(error => <Message.Item key={error.path}>{error.message}</Message.Item>)}
            </Message.List>
          </Message>
          <p className='forgot'><Link to='/reset_password'>Forgot Password?</Link></p>
          <Button className={'ui button button-block submit' + (isFetching ? ' loading' : '')}>{submit}</Button>
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

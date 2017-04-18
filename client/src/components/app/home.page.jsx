// React
import React from 'react';
import { connect } from 'react-redux';

import AuthPage from '../auth/auth.page';

// HomeComponent displaying either the register/login component or information about Docktor when authenticated
class HomeComponent extends React.Component {

  render = () => {
    const { isAuthenticated } = this.props;
    var content;
    if (isAuthenticated) {
      content = (<div />);
    } else {
      content = (<AuthPage/>);
    }
    return (
      content
    );
  }
}

HomeComponent.propTypes = {
  isAuthenticated : React.PropTypes.bool.isRequired
};

// Function to map state to container props
const mapStateToProps = (state) => {
  const { auth } = state;
  const { isAuthenticated } = auth;

  return {
    isAuthenticated
  };
};

// Redux container to Sites component
const Home = connect(
  mapStateToProps,
  null
)(HomeComponent);

export default Home;

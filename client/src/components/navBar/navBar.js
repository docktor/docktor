// React
import React from 'react';
import { IndexLink, Link } from 'react-router';
import { connect } from 'react-redux';

import { logoutUser } from '../../modules/auth/auth.thunk.js';
import { isRoleAuthorized } from '../../modules/auth/auth.wrappers.js';

// Style
import './navBar.scss';

// NavBar Component
class NavBarComponent extends React.Component {

  isAuthorized(Roles) {
    return this.props.isAuthenticated && isRoleAuthorized(Roles, this.props.role);
  }

  componentDidMount() {
    $('.navbar .ui.dropdown').dropdown();
  }

  componentDidUpdate() {
    $('.navbar .ui.dropdown').dropdown();
  }

  render() {
    const { logout } = this.props;
    return (
      <div className='ui inverted fluid menu navbar'>
        <IndexLink to='/' className='item brand'>
          <i className='large fitted doctor icon'></i>{' '}Docktor
        </IndexLink>
        {this.isAuthorized(['admin']) && <Link to='/daemons' activeClassName='active' className='item'>Daemons</Link>}
        {this.isAuthorized() && <Link to='/groups' activeClassName='active' className='item'>Groups</Link>}
        {this.isAuthorized() && <Link to='/users' activeClassName='active' className='item'>Users</Link>}
        {this.isAuthorized() &&
        <div className='right menu'>
          <div className='ui dropdown item'>
            <i className='inverted large user icon'></i>{' '} Admin
            <div className='menu'>
              <a className='item'>Settings</a>
              <a className='item' onClick={logout} >Logout</a>
            </div>
          </div>
        </div>}
      </div>
    );
  }
}
NavBarComponent.propTypes = {
  isAuthenticated: React.PropTypes.bool.isRequired,
  role: React.PropTypes.string,
  logout: React.PropTypes.func.isRequired
};

// Function to map state to container props
const mapStateToProps = (state) => {
  return {
    isAuthenticated: state.auth.isAuthenticated,
    role: state.auth.user.role
  };
};

// Function to map dispatch to container props
const mapDispatchToProps = (dispatch) => {
  return {
    logout : () => {
      dispatch(logoutUser());
    }
  };
};

// Redux container to Sites component
const NavBar = connect(
  mapStateToProps,
  mapDispatchToProps
)(NavBarComponent);

export default NavBar;

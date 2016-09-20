// React
import React from 'react';
import { IndexLink, Link } from 'react-router';
import { connect } from 'react-redux';

import AuthThunks from '../auth/auth.thunk.js';
import ExportThunks from '../export/export.thunk.js';
import { isRoleAuthorized } from '../auth/auth.wrappers.js';

// Constants
import { AUTH_ADMIN_ROLE } from '../auth/auth.constants.js';

// Style
import './navBar.component.scss';

// NavBar Component
class NavBarComponent extends React.Component {

  isAuthorized(Roles) {
    return this.props.auth.isAuthenticated && isRoleAuthorized(Roles, this.props.auth.user.role);
  }

  componentDidMount() {
    $('.navbar .ui.dropdown').dropdown();
  }

  componentDidUpdate() {
    $('.navbar .ui.dropdown').dropdown();
  }

  isActiveURL(url) {
    if (!this.props.location || !this.props.location.pathname) {
      return '';
    }
    return this.props.location.pathname.startsWith(url) ? ' active' : '';
  }

  render() {
    const { logout, exportDocktor, isExportFetching } = this.props;
    return (
      <div className='ui inverted fluid menu navbar'>
        <IndexLink to='/' className='item brand'>
          <i className='large fitted doctor icon'></i>{' '}Docktor
        </IndexLink>
        {this.isAuthorized([AUTH_ADMIN_ROLE]) && <Link to='/daemons' className={'item' + this.isActiveURL('/daemons')}>Daemons</Link>}
        {this.isAuthorized() && <Link to='/services' className={'item' + this.isActiveURL('/services')}>Services</Link>}
        {this.isAuthorized() && <Link to='/groups' className={'item' + this.isActiveURL('/groups')}>Groups</Link>}
        {this.isAuthorized() && <Link to='/users' className={'item' + this.isActiveURL('/users')}>Users</Link>}
        {this.isAuthorized() &&
        <div className='right menu'>
          {isExportFetching ? <div className='loader'><i className='inverted large notched circle icon loading'></i></div> : ''}
          <div className='ui dropdown item'>
            <i className='inverted large user icon'></i>{' ' + this.props.auth.user.displayName}
            <div className='menu'>
              {this.isAuthorized([AUTH_ADMIN_ROLE]) && <a onClick={exportDocktor} className='item'><i className='download icon'></i>Export</a>}
              <a className='item'><i className='settings icon'></i>Settings</a>
              <a className='item' onClick={logout} ><i className='sign out icon'></i>Logout</a>
            </div>
          </div>
        </div>}
      </div>
    );
  }
}
NavBarComponent.propTypes = {
  logout: React.PropTypes.func.isRequired,
  exportDocktor: React.PropTypes.func.isRequired,
  auth: React.PropTypes.object.isRequired,
  location: React.PropTypes.object.isRequired,
  isExportFetching: React.PropTypes.bool.isRequired
};

// Function to map state to container props
const mapStateToProps = (state) => {
  return {
    auth: state.auth,
    location: state.routing.locationBeforeTransitions,
    isExportFetching: state.export.isFetching
  };
};

// Function to map dispatch to container props
const mapDispatchToProps = (dispatch) => {
  return {
    logout: () => {
      dispatch(AuthThunks.logoutUser());
    },
    exportDocktor: () => {
      dispatch(ExportThunks.exportAll());
    }
  };
};

// Redux container to Sites component
const NavBar = connect(
  mapStateToProps,
  mapDispatchToProps
)(NavBarComponent);

export default NavBar;

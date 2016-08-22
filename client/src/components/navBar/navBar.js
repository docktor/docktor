// React
import React from 'react';
import { IndexLink, Link } from 'react-router';
import { connect } from 'react-redux';

// Style
import './navBar.scss';

// NavBar Component
class NavBarComponent extends React.Component {
  render() {
    const { isAuthenticated } = this.props;
    return (
      <div className='ui inverted fluid menu navbar'>
        <IndexLink to='/' className='item brand'>
          <i className='large fitted doctor icon'></i>{' '}Docktor
        </IndexLink>
        {isAuthenticated && <Link to='/daemons' activeClassName='active' className='item'>Daemons</Link>}
        {isAuthenticated && <Link to='/groups' activeClassName='active' className='item'>Groups</Link>}
        {isAuthenticated && <Link to='/users' activeClassName='active' className='item'>Users</Link>}
        {isAuthenticated && <div className='right menu'>
          <a href='#' className='item'><i className='inverted large user icon'></i>{' '} Admin</a>
        </div>}
      </div>
    );
  }
}
NavBarComponent.propTypes = { isAuthenticated: React.PropTypes.bool.isRequired };

// Function to map state to container props
const mapStateToProps = (state) => {
  return { isAuthenticated: state.auth.isAuthenticated };
};

// Function to map dispatch to container props
const mapDispatchToProps = (dispatch) => {
  return {};
};

// Redux container to Sites component
const NavBar = connect(
  mapStateToProps,
  mapDispatchToProps
)(NavBarComponent);

export default NavBar;

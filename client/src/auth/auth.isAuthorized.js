import React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { isRoleAuthorized } from './auth.wrappers.js';

// Wrapper rendering the child component only when authenticated and authorized
export function requireAuthorization(Component, Roles) {

    class AuthenticatedComponent extends React.Component {

        componentWillMount () {
          const { isAuthenticated, user, isFetching } = this.props.auth;
          this.checkAuth(isAuthenticated, user.role, isFetching);
        }

        componentWillUpdate () {
          const { isAuthenticated, user, isFetching } = this.props.auth;
          this.checkAuth(isAuthenticated, user.role, isFetching);
        }

        componentWillReceiveProps (nextProps) {
          const { isAuthenticated, user, isFetching } = nextProps.auth;
          this.checkAuth(isAuthenticated, user.role, isFetching);
        }

        componentDidMount() {
          const { isAuthenticated, user, isFetching } = this.props.auth;
          this.checkAuth(isAuthenticated, user.role, isFetching);
        }

        checkAuth (isAuthenticated, userRole, isFetching) {
            if (!isAuthenticated) {
                let redirectAfterLogin = this.props.loc.pathname;
                this.props.redirect('/login?next=' + redirectAfterLogin);
            } else if (!isRoleAuthorized(Roles, userRole) && !isFetching) {
                this.props.redirect('/');
            }
        }

        render () {
          const isAuthenticated = this.props.auth.isAuthenticated;
          const role = this.props.auth.user.role;
          if (isAuthenticated && isRoleAuthorized(Roles, role)) {
            return <Component {...this.props}/>;
          }

          return <div></div>;
        }
    }
    AuthenticatedComponent.propTypes = {
      redirect: React.PropTypes.func.isRequired,
      auth: React.PropTypes.object,
      loc: React.PropTypes.object
    };

    const mapStateToProps = (state) => ({
        auth: state.auth,
        loc: state.routing.locationBeforeTransitions
    });

    // Function to map dispatch to container props
    const mapDispatchToProps = (dispatch) => {
      return {
        redirect : (path) => {
          dispatch(push(path));
        }
      };
    };

    return connect(mapStateToProps, mapDispatchToProps)(AuthenticatedComponent);

}
import React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { isRoleAuthorized } from './auth.wrappers.js';

// Wrapper rendering the child component only when authenticated
export function requireAuthorization(Component, Roles) {

    class AuthenticatedComponent extends React.Component {

        componentWillMount () {
            this.checkAuth(this.props.auth.isAuthenticated, this.props.auth.user.role);
        }

        componentWillUpdate () {
            this.checkAuth(this.props.auth.isAuthenticated, this.props.auth.user.role);
        }

        componentWillReceiveProps (nextProps) {
            this.checkAuth(nextProps.auth.isAuthenticated, nextProps.auth.user.role);
        }

        componentDidMount() {
            this.checkAuth(this.props.auth.isAuthenticated, this.props.auth.user.role);
        }

        checkAuth (isAuthenticated, userRole) {
            if (!isAuthenticated) {
                let redirectAfterLogin = this.props.loc.pathname;
                this.props.redirect('/auth?next=' + redirectAfterLogin);
            } else if (!isRoleAuthorized(Roles, userRole) && !this.props.auth.isFetching) {
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

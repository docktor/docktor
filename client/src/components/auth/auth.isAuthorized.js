import React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { isRoleAuthorized } from '../../modules/auth/auth.wrappers.js';

// Wrapper rendering the child component only when authenticated
export function requireAuthorization(Component, Roles) {

    class AuthenticatedComponent extends React.Component {

        componentWillMount () {
            this.checkAuth(this.props.isAuthenticated, this.props.role);
        }

        componentWillUpdate () {
            this.checkAuth(this.props.isAuthenticated, this.props.role);
        }

        componentWillReceiveProps (nextProps) {
            this.checkAuth(nextProps.isAuthenticated, this.props.role);
        }

        componentDidMount() {
            this.checkAuth(this.props.isAuthenticated, this.props.role);
        }

        checkAuth (isAuthenticated, userRole) {
            if (!isAuthenticated) {
                let redirectAfterLogin = this.props.loc.pathname;
                this.props.redirect('/auth?next=' + redirectAfterLogin);
            }
            if (!isRoleAuthorized(Roles, userRole)) {
              this.props.redirect('/');
            }
        }

        render () {
          if (this.props.isAuthenticated && isRoleAuthorized(Roles, this.props.role)) {
            return <Component {...this.props}/>;
          }

          return <div></div>;
        }
    }
    AuthenticatedComponent.propTypes = {
      isAuthenticated: React.PropTypes.bool.isRequired,
      redirect: React.PropTypes.func.isRequired,
      role: React.PropTypes.string,
      loc: React.PropTypes.object
    };

    const mapStateToProps = (state) => ({
        isAuthenticated: state.auth.isAuthenticated,
        role : state.auth.user.role,
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

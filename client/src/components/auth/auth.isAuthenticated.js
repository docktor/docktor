import React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

// Wrapper rendering the child component only when authenticated
export function requireAuthentication(Component) {

    class AuthenticatedComponent extends React.Component {

        componentWillMount () {
            this.checkAuth(this.props.isAuthenticated);
        }

        componentWillReceiveProps (nextProps) {
            this.checkAuth(nextProps.isAuthenticated);
        }

        checkAuth (isAuthenticated) {
            if (!isAuthenticated) {
                this.props.redirect('/auth');
            }
        }

        render () {
            if (this.props.isAuthenticated) {
              return (<Component {...this.props}/>);
            } else {
              return (<div></div>);
            }
        }
    }
    AuthenticatedComponent.propTypes = {
      isAuthenticated: React.PropTypes.bool.isRequired,
      redirect: React.PropTypes.func.isRequired
    };

    const mapStateToProps = (state) => ({
        isAuthenticated: state.auth.isAuthenticated
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

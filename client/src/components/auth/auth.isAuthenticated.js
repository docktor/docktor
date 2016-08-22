import React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

// Wrapper rendering the child component only when authenticated
export function requireAuthentication(Component) {
    console.log('requireAuthentication');
    class AuthenticatedComponent extends React.Component {

        componentWillMount () {
          console.log('componentWillMount');
            this.checkAuth(this.props.isAuthenticated);
        }

        componentWillUpdate () {
          console.log('componentWillUpdate');
            this.checkAuth(this.props.isAuthenticated);
        }

        componentWillReceiveProps (nextProps) {
          console.log('componentWillReceiveProps');
            this.checkAuth(nextProps.isAuthenticated);
        }

        componentDidMount() {
          console.log('componentDidMount');
            this.checkAuth(this.props.isAuthenticated);
        }

        checkAuth (isAuthenticated) {
          console.log('checkAuth');
            if (!isAuthenticated) {
                this.props.redirect('/auth');
            }
        }

        render () {
          return (
              <div>
                  {this.props.isAuthenticated === true
                      ? <Component {...this.props}/>
                      : null
                  }
              </div>
          );
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

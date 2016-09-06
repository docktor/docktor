// React
import React from 'react';
import classNames from 'classnames';

// Style
import './auth.component.scss';

// Auth tab containing signin and register panes
class Auth extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: this.props.selected
    };
  }
  _handleClick(index) {
    this.setState({
      selected: index
    });
    this.props.onSwitch();
  }
  _renderTitles() {
    function labels(child, index) {
      let liClasses = classNames({
        'tab': true,
        'active' : this.state.selected === index
      });
      return (
        <li key={index} className={liClasses}>
          <a href='#' onClick={() => this._handleClick(index)}>{child.props.label}</a>
        </li>
      );
    }
    return (
      <ul className='tab-group'>
        {this.props.children.map(labels.bind(this))}
      </ul>
    );
  }
  _renderContent() {
    return (
      <div className='tab-content'>
        {this.props.children[this.state.selected]}
      </div>
    );
  }
  render() {
    return (
      <div className='login-form'>
        <div className='login'>
          {this._renderTitles()}
          {this._renderContent()}
        </div>
      </div>
    );
  }
};
Auth.propTypes = {
  selected: React.PropTypes.number,
  children: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.element
  ]).isRequired,
  onSwitch: React.PropTypes.func
};
Auth.defaultProps = {
  selected: 0
};

export default Auth;

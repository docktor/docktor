// React
import React from 'react';
import classNames from 'classnames';
import {
  Link
} from 'react-router';

// Style
import './tabform.component.scss';

// TabForm containing tabs
class TabForm extends React.Component {
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
        'active': this.state.selected === index
      });
      return (
        <li key = {index} className = {liClasses} >
          <a href={'#' + child.props.link} onClick = {() => this._handleClick(index)} > {child.props.label} </a>
        </li>
      );
    }
    return ( <ul className = 'tab-group' > {
        this
        .props
        .children
        .map(labels.bind(this))
      } </ul>
    );
  }
  _renderContent() {
    return (
      <div className = 'tab-content' > {this.props.children[this.state.selected]} </div>
    );
  }
  render() {
    return (
      <div className = 'tab-form' >
        <div className = 'tabs' > {this._renderTitles()} {this._renderContent()} </div>
      </div>
    );
  }
};
TabForm.propTypes = {
  selected: React.PropTypes.number,
  children: React
    .PropTypes
    .oneOfType([React.PropTypes.array, React.PropTypes.element])
    .isRequired,
  onSwitch: React.PropTypes.func
};
TabForm.defaultProps = {
  selected: 0
};

export default TabForm;

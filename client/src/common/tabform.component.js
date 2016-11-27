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
  _childsAsArray() {
      if (!Array.isArray(this.props.children)) {
        return [this.props.children];
      }
      return this.props.children;
    }
  _handleClick(index) {
    this.setState({
      selected: index
    });
    const sw = this.props.onSwitch;
    if (sw) {
      sw();
    }
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
    function title(childs, _this) {
      if (childs.length <= 1) {
        return (<div></div>);
      } else {
        return ( <ul className = 'tab-group' > {
                childs.map(labels.bind(_this))
              } </ul>
            );
      }
    }
   return title(this._childsAsArray(), this);
  }
  _renderContent() {
    return (
      <div className = 'tab-content' > {this._childsAsArray()[this.state.selected]} </div>
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

// React
import React from 'react';
import classNames from 'classnames';

// Style
import './tabform.component.scss';

// TabForm containing tabs
class TabForm extends React.Component {

  state = { selected: 0 }

  componentWillMount = () => {
    this.setState({ selected: this.props.selected });
  }

  componentWillReceiveProps = (nextProps) => {
    this.setState({ selected: nextProps.selected });
  }

  childsAsArray = () => {
    if (!Array.isArray(this.props.children)) {
      return [this.props.children];
    }
    return this.props.children;
  }

  handleClick = (index) => () => {
    this.setState({
      selected: index
    });
    const sw = this.props.onSwitch;
    sw && sw();
  }

  renderLabels = (child, index) => {
    const classes = classNames(
      'tab',
      { 'active': this.state.selected === index }
    );
    return (
      <li key={index} className={classes} >
        <a href={`#${child.props.link}`} onClick={this.handleClick(index)}>{child.props.label}</a>
      </li>
    );
  };

  renderTitles = (childs) => {
    if (childs.length <= 1) {
      return <div />;
    } else {
      return <ul className = 'tab-group' >{childs.map(this.renderLabels)}</ul>;
    }
  }

  renderContent = (child) => (
    <div className = 'tab-content'>{child}</div>
  );

  render = () => {
    const childs = this.childsAsArray();
    const selected = childs[this.state.selected];
    return (
      <div className='tab-form'>
        <div className='tabs'>{this.renderTitles(childs)}{this.renderContent(selected)}</div>
      </div>
    );
  }
};

TabForm.propTypes = {
  selected: React.PropTypes.number,
  children: React.PropTypes
    .oneOfType([React.PropTypes.array, React.PropTypes.element])
    .isRequired,
  onSwitch: React.PropTypes.func
};

TabForm.defaultProps = {
  selected: 0
};

export default TabForm;

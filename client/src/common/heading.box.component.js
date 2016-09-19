// React
import React from 'react';

import './heading.box.component.scss';

// Heading box is a box with heading
class HeadingBox extends React.Component {
  render() {
    const { icon, title, children } = this.props;
    return (
      <div className='box'>
        <div className='ui attached message box-header'>
          <div className='header'>
            <i className={icon}></i><span className='title'>{title}</span>
          </div>
        </div>
        <div className={'ui attached fluid segment ' + this.props.className}>
          {children}
        </div>
      </div>
    );
  }
};
HeadingBox.propTypes = {
  icon: React.PropTypes.string,
  children: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.element
  ]).isRequired,
  title: React.PropTypes.string,
  className: React.PropTypes.string
};

export default HeadingBox;

// React
import React from 'react';
import classNames from 'classnames';

import './heading.box.component.scss';

// Heading box is a box with heading
class HeadingBox extends React.Component {

  constructor(props) {
    super(props);
    this.state = { stacked : props.stacked };
  }

  toggle() {
    this.setState({ stacked: !this.state.stacked });
  }

  render() {
    const { icon, title, children, className } = this.props;
    const stacked = this.state.stacked;
    const headerClasses = classNames(
      { plus: stacked },
      { minus: !stacked },
      'square outline link icon'
    );
    const panelClasses = classNames(
      'ui attached fluid segment',
      className,
      { hidden: stacked }
    );
    return (
      <div className='box'>
        <div className='ui attached message box-header' onClick={() => this.toggle()}>
          <div className='header'>
            <i className={icon}></i>
            <span className='title'>{title}</span>
            <div className='ui right floated header'>
                <i className={headerClasses}></i>
            </div>
          </div>
        </div>
        <div className={panelClasses}>
          {children}
        </div>
      </div>
    );
  }
};
HeadingBox.propTypes = {
  icon: React.PropTypes.string,
  stacked: React.PropTypes.bool,
  children: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.element
  ]).isRequired,
  title: React.PropTypes.string,
  className: React.PropTypes.string
};

export default HeadingBox;

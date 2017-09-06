// React
import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Message, Segment, Header } from 'semantic-ui-react';
import classNames from 'classnames';

import './heading.box.component.scss';

// Heading box is a box with heading
class HeadingBox extends React.Component {

  state = { stacked : false };

  componentWillMount = () => {
    this.setState({ stacked: this.props.stacked });
  }

  toggle = () => {
    this.setState((prevState) => {return { stacked: !prevState.stacked };});
  }

  render = () => {
    const { icon, title, children, className } = this.props;
    const { stacked } = this.state;
    const stackedIcon = stacked ? 'plus' : 'minus';
    const panelClasses = classNames(
      className,
      { hidden: stacked }
    );
    return (
      <div className='box'>
        <Message attached className='box-header' onClick={this.toggle}>
          <Message.Header>
            <Icon name={icon} size='large'/>
            <span className='title'>{title}</span>
            <Header floated='right'>
              <Icon link name={stackedIcon + ' square outline'} />
            </Header>
          </Message.Header>
        </Message>
        <Segment attached className={panelClasses}>
          {children}
        </Segment>
      </div>
    );
  }
};

HeadingBox.propTypes = {
  icon: PropTypes.string,
  stacked: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.element
  ]).isRequired,
  title: PropTypes.string,
  className: PropTypes.string
};

export default HeadingBox;

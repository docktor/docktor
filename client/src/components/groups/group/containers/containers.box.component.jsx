// React
import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

// Components
import HeadingBox from '../../../common/boxes/box/heading.box.component';
import { Form,  Button, Dropdown, Label, Loader, Dimmer } from 'semantic-ui-react';
import ContainersView from './containers.view.component';

import set from 'lodash.set';

import TagsSelectors from '../../../../modules/tags/tags.selectors.js';

import './containers.box.component.scss';

// ContainersBox is a list of containers
class ContainersBoxComponent extends React.Component {

  // Available colors for tags
  colors = ['orange', 'teal', 'blue', 'violet', 'purple', 'yellow'];
  // Available displays
  GRID_DISPLAY='grid'
  LIST_DISPLAY='list'
  displays = [this.GRID_DISPLAY, this.LIST_DISPLAY]

  // Save choice to local storage
  // When user comes displays again the box, default display will the one from his last choice
  saveToLocalStorage = (groupId, property, value) => {
    var settings = JSON.parse(localStorage.getItem('settings')) || {};
    set(settings, `groups.${groupId}.${property}`, value);
    localStorage.setItem('settings', JSON.stringify(settings));
  }

  onChangeDisplay = (groupId, display) => {
    this.saveToLocalStorage(groupId, 'display', display);
  }

  onChangeGroupBy= (groupId, groupBy) => {
    this.saveToLocalStorage(groupId, 'groupBy', groupBy);
  }

  getColorCategories = (categories) => {
    var colors = {};
    Object.keys(categories).forEach((catslug, index) => {
      colors[catslug] = this.colors[index % this.colors.length];
    });
    return colors;
  }

  // Create options for groupBy dropdown
  groupByOptions = (categories, colorCategories) => {
    return Object.keys(categories).sort().map(categorySlug => {
      return {
        value: categorySlug || '',
        text : categories[categorySlug][0].category.raw || '',
        label: { color: colorCategories[categorySlug], empty: true, circular: true }
      };
    });
  }

  componentWillMount = () => {
    const { display, groupBy } = this.props;
    this.setDisplay(display);
    this.setGroupBy(groupBy);
  }

  componentWillReceiveProps = (nextProps) => {
    const { display, groupBy } = nextProps;
    this.setDisplay(display);
    this.setGroupBy(groupBy);
  }

  setDisplay = (display) => {
    const disp = this.displays.includes(display) ? display : this.GRID_DISPLAY;
    this.setState({ display: disp });
  }

  setGroupBy = (groupBy) => {
    this.setState({ groupBy: groupBy });
  }


  renderContainers = (isFetching, groupBy, categories, containers, display, services, daemons, tags, colorCategories) => {
    if (isFetching) {
      return <Dimmer inverted active><Loader size='big' content='Loading'/></Dimmer>;
    }
    if (containers.length === 0 ) {
      return <span>No container</span>;
    }
    if (groupBy === '' || !categories[groupBy]) {
      return <ContainersView daemons={daemons} containers={containers} colorTagCategories={colorCategories} display={display} services={services} tags={tags} />;
    } else {
       // Renders a view grouped by the tags of a given category
      // If container does not have a tag with given category, it's set in a OTHERS category.
      const c = TagsSelectors.getContainersGroupedByCategory(categories[groupBy], containers, services);
      return c.map(containersByTag => {
        if (containersByTag.containers.length === 0) {
          return '';
        }
        return (
          <div className='group-by-view' key={containersByTag.tag.id}>
            <h4 className='ui horizontal divider header'>
              <Label circular empty color={containersByTag.tag && colorCategories[containersByTag.tag.category.slug]}/>
              {containersByTag.tag.name.raw}
            </h4>
            <ContainersView daemons={daemons} containers={containersByTag.containers} colorTagCategories={colorCategories}
                            display={display} services={services} tags={tags} tagToFilter={containersByTag.tag}
            />
          </div>
        );
      });
    }
  }

  render = () => {
    const { display, groupBy } = this.state;
    const { containers, daemons, services, tags, group, loc, isFetching } = this.props;
    const categories = TagsSelectors.getTagCategories(containers, services, tags);
    const colorCategories = this.getColorCategories(categories);
    const groupByOptions = this.groupByOptions(categories, colorCategories);

    return (
      <Form as={HeadingBox} className='box-component' icon='cube' title='Containers'>
       <div className='layout horizontal justified'>
          <Button.Group  labeled>
            <Button disabled icon='stop' content='Stop all' />
            <Button disabled icon='play' content='Start all' />
            <Button disabled icon='repeat' content='Restart all' />
            <Button disabled icon='cloud upload' content='Redeploy all' />
            <Button disabled icon='trash' content='Uninstall all' />
          </Button.Group>
          <div className='layout horizontal jusitified' >
            <Dropdown disabled={groupByOptions.length == 0} text={categories[groupBy] && categories[groupBy][0].category.raw || 'Group by'}
                      value={groupBy || ''} floating labeled button className='icon' icon='filter'>
              <Dropdown.Menu>
                <Dropdown.Item value='' as={Link} to={{ pathname: `/groups/${group.id}`, query:{ display: loc.query.display } }}
                                onClick={() => this.onChangeGroupBy(group.id, '')} >
                  <Button fluid compact content='Cancel'/>
                </Dropdown.Item>
                <Dropdown.Menu scrolling>
                  {groupByOptions.map((category) => <Dropdown.Item
                    as={Link} to={{ pathname: `/groups/${group.id}`, query:{ ...loc.query, groupBy: category.value } }}
                    active={groupBy === category.value}
                    onClick={() => this.onChangeGroupBy(group.id, category.value)}
                    key={category.value} {...category} />)
                  }
                </Dropdown.Menu>
              </Dropdown.Menu>
            </Dropdown>
            {' '}
            <Button.Group>
              <Button toggle
                active={display === this.GRID_DISPLAY}
                as={Link} to={{ pathname: `/groups/${group.id}`, query:{ ...loc.query, display: this.GRID_DISPLAY } }}
                onClick={() => this.onChangeDisplay(group.id, this.GRID_DISPLAY)}
                title='Display services as cards' icon='grid layout'/>
              <Button toggle
                active={display === this.LIST_DISPLAY}
                as={Link} to={{ pathname: `/groups/${group.id}`, query:{ ...loc.query, display: this.LIST_DISPLAY } }}
                onClick={() => this.onChangeDisplay(group.id, 'list')}
                title='Display services as a list' icon='list layout'/>
            </Button.Group>
          </div>
        </div>
        <div className='ui dimmable containers'>
          {this.renderContainers(isFetching, groupBy, categories, containers, display, services, daemons, tags, colorCategories)}
        </div>
      </Form>
    );
  };
}

ContainersBoxComponent.propTypes = {
  containers: React.PropTypes.array.isRequired,
  services: React.PropTypes.object.isRequired,
  tags: React.PropTypes.object.isRequired,
  daemons: React.PropTypes.object.isRequired,
  display: React.PropTypes.string,
  groupBy: React.PropTypes.string,
  group: React.PropTypes.object.isRequired,
  loc: React.PropTypes.object.isRequired,
  isFetching: React.PropTypes.bool.isRequired
};

// Function to map state to container props
const mapStateToProps = (state, ownProps) => {
  const loc = state.routing.locationBeforeTransitions;
  const { containers, services, tags, daemons, display, groupBy, group, isFetching } = ownProps;
  return {
    isFetching: isFetching || services.isFetching || tags.isFetching,
    containers: containers || [],
    services: services || {},
    tags: tags || {},
    daemons: daemons || {},
    display,
    groupBy: groupBy || '',
    group: group || {},
    loc
  };
};

// Redux container to component
const ContainersBox = connect(
  mapStateToProps,
  null
)(ContainersBoxComponent);

export default ContainersBox;

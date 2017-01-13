// React
import React from 'react';
import { Link } from 'react-router';

// Components
import HeadingBox from '../../../common/boxes/box/heading.box.component';
import { Form,  Button, Dropdown, Label } from 'semantic-ui-react';
import ContainersView from './containers.view.component';

import uniqBy from 'lodash.uniqby';
import groupBy from 'lodash.groupby';
import flatMap from 'lodash.flatmap';
import sortBy from 'lodash.sortby';
import differenceBy from 'lodash.differenceby';
import set from 'lodash.set';

import './containers.box.component.scss';

// ContainersBox is a list of containers
class ContainersBox extends React.Component {

  colors = ['orange', 'teal', 'blue', 'violet', 'purple', 'yellow'];
  dummyTag= {
    id: 'others',
    name: { raw: 'Others', slug: 'others' },
    category: { raw: 'Others', slug: 'others' }
  }
  GRID_DISPLAY='grid'
  LIST_DISPLAY='list'
  displays = [this.GRID_DISPLAY, this.LIST_DISPLAY]


  onChangeDisplay = (groupId, display) => {
    // Save choice to local storage
    // When user comes displays again the box, default display will the one from his last choice
    var settings = JSON.parse(localStorage.getItem('settings')) || {};
    set(settings, `groups.${groupId}.display`, display);
    localStorage.setItem('settings', JSON.stringify(settings));
  }

  onChangeGroupBy= (groupId, groupBy) => {
    var settings = JSON.parse(localStorage.getItem('settings')) || {};
    set(settings, `groups.${groupId}.groupBy`, groupBy);
    localStorage.setItem('settings', JSON.stringify(settings));
  }

  // Renders a view grouped by the tags of a given category
  // If container does not have a tag with given category, it's set in a OTHERS category.
  renderContainersGroupedBy = (tagsFromCategory, allContainers, display, services, daemons, tags, colorTagCategories) => {
    // Iterate through all tags from given category
    const containersByTag = tagsFromCategory.map(tag => {
      // Keep only containers with given tag
      const containersWithTag = allContainers.filter(container => {
        const tags = container.tags || [];
        return tags.includes(tag.id);
      });
      // Keep only services with given tag
      const servicesWithTag = allContainers.map(container => services.items[container.serviceId])
                                           .filter(service => Boolean(service))
                                           .filter(service => service.tags.includes(tag.id));
      // Keep only containers of a type of service containing given tag
      const containersFromServicesWithTags = allContainers.filter(container => servicesWithTag.filter( service => service.id === container.serviceId).length > 0);

      // Merge
      return { tag: tag, containers: uniqBy(containersWithTag.concat(containersFromServicesWithTags), 'id') };
    });

    const containersContainingTags = flatMap(containersByTag, (container) => container.containers);
    const containersWithoutTags = differenceBy(allContainers, containersContainingTags, 'id');

    const c = containersByTag.concat({ tag : this.dummyTag, containers: containersWithoutTags });

    return c.map(containersByTag => {
      return (
        <div className='group-by-view' key={containersByTag.tag.id}>
          <h4 className='ui horizontal divider header'>
            <Label circular empty color={containersByTag.tag && colorTagCategories[containersByTag.tag.category.slug]}/>
            {containersByTag.tag.name.raw}
          </h4>
          <ContainersView daemons={daemons || []} containers={containersByTag.containers || []} colorTagCategories={colorTagCategories}
                          display={display} services={services} tags={tags} tagToFilter={containersByTag.tag}
          />
        </div>
      );
    });

  }

  getTagCategories = (containers, services, tags) => {

    // Get tag ids from containers
    const containersTagsIds = flatMap(containers, (container) => container.tags);

    // Get tags ids from services
    const containerServices = containers.map(container => services.items[container.serviceId])
                                        .filter(service => Boolean(service));
    const containerServicesTagsIds = flatMap(containerServices, (container) => container.tags);

    // Merge tags
    const allTagIds = containersTagsIds.concat(containerServicesTagsIds);
    const allTags = allTagIds.map(tagId => tags.items[tagId]).filter(tag => Boolean(tag));
    const uniqAllTags = uniqBy(allTags, 'id');
    const sortedAllTags = sortBy(uniqAllTags, 'name.slug');

    // Get categories from tags
    const categories = groupBy(sortedAllTags, (tag) => tag.category.slug);

    return categories;
  }

  getColorCategories = (categories) => {
    var colors = {};
    Object.keys(categories).forEach((catslug, index) => {
      colors[catslug] = this.colors[index % this.colors.length];
    });
    return colors;
  }

  getTagCategoriesFromDropdown = (categories, colorCategories) => {
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
    const disp = this.displays.includes(display) ? display : 'grid';
    this.setState({ display: disp });
  }

  setGroupBy = (groupBy) => {
    this.setState({ groupBy: groupBy });
  }

  render = () => {
    const { display, groupBy } = this.state;
    const { containers, daemons, services, tags, group, loc } = this.props;
    const categories = this.getTagCategories(containers, services, tags);
    const colorCategories = this.getColorCategories(categories);
    const tagCategories = this.getTagCategoriesFromDropdown(categories, colorCategories);
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
            <Dropdown disabled={tagCategories.length == 0} text={categories[groupBy] && categories[groupBy][0].category.raw || 'Group by'} value={groupBy || ''} floating labeled button className='icon' icon='filter'>
              <Dropdown.Menu>
                <Dropdown.Item value='' as={Link} to={{ pathname: `/groups/${group.id}`, query:{ display: loc.query.display } }} onClick={() => this.onChangeGroupBy(group.id, '')} >
                  <Button fluid compact content='Cancel'/>
                </Dropdown.Item>
                <Dropdown.Menu scrolling>
                  {tagCategories.map((category) => <Dropdown.Item
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
        <div className='containers'>
          {groupBy === '' && <ContainersView daemons={daemons || []} containers={containers || []} colorTagCategories={colorCategories} display={display} services={services || {}} tags={tags || {}} />}
          {groupBy !== '' && this.renderContainersGroupedBy(categories[groupBy] || [], containers || [], display, services || {}, daemons || [], tags || {}, colorCategories)}
        </div>
      </Form>
    );
  };
}

ContainersBox.propTypes = {
  containers: React.PropTypes.array,
  services: React.PropTypes.object,
  tags: React.PropTypes.object,
  daemons: React.PropTypes.array,
  display: React.PropTypes.string,
  groupBy: React.PropTypes.string,
  group: React.PropTypes.object,
  loc: React.PropTypes.object
};

export default ContainersBox;

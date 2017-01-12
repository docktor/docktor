// React
import React from 'react';

// Components
import HeadingBox from '../../../common/boxes/box/heading.box.component';
import { Form,  Button, Dropdown } from 'semantic-ui-react';
import ContainersView from './containers.view.component';

import uniqBy from 'lodash.uniqby';
import groupBy from 'lodash.groupby';
import flatMap from 'lodash.flatmap';
import sortBy from 'lodash.sortby';

import './containers.box.component.scss';

// ContainersBox is a list of containers
class ContainersBox extends React.Component {

  state = {
    display: 'grid',
    groupBy: { value: '', text: '' }
  }

  onChangeDisplay = (display) => {
    this.setState({ display: display });
  }

  onChangeGroupBy= (e, { value, text }) => {
    e.preventDefault();
    this.setState({ groupBy: { text: text, value: value } });
  }

  renderContainersGroupedBy = (tagsFromCategory, allContainers, display, services, daemons) => {
    return tagsFromCategory.map(tag => {
      const containersWithTag = allContainers.filter(container => {
        const tags = container.tags || [];
        return tags.includes(tag.id);
      });
      const servicesWithTag = allContainers.map(container => services.items[container.serviceId]).filter(service => Boolean(service)).filter(service => service.tags.includes(tag.id));
      const containersFromServicesWithTags = allContainers.filter(container => servicesWithTag.filter( service => service.id === container.serviceId).length > 0);
      const containers = uniqBy(containersWithTag.concat(containersFromServicesWithTags), 'id');
      return (
        <div className='group-by-view' key={tag.id}>
          <h4 className='ui horizontal divider header'>{tag.name.raw}</h4>
          <ContainersView daemons={daemons || []} containers={containers || []} display={display} services={services} />
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

  getTagCategoriesFromDropdown = (categories) => {
    return Object.keys(categories).map(categorySlug => {
      return { 'value': categorySlug || '', 'text' : categories[categorySlug][0].category.raw || '' };
    });
  }

  render = () => {
    const { display, groupBy } = this.state;
    const { containers, daemons, services, tags } = this.props;
    const categories = this.getTagCategories(containers, services, tags);
    const tagCategories = this.getTagCategoriesFromDropdown(categories);
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
            <Dropdown text={groupBy.text || 'Group by'} value={groupBy.value || ''} floating labeled button className='icon' icon='filter'>
              <Dropdown.Menu>
                <Dropdown.Item value='' onClick={this.onChangeGroupBy}>
                  <Button fluid compact content='Cancel'/>
                </Dropdown.Item>
                <Dropdown.Menu scrolling>
                  {tagCategories.map((category) => <Dropdown.Item active={groupBy.value === category.value} onClick={this.onChangeGroupBy} key={category.value} {...category} />)}
                </Dropdown.Menu>
              </Dropdown.Menu>
            </Dropdown>
            {' '}
            <Button.Group>
              <Button toggle active={display === 'grid'} onClick={() => this.onChangeDisplay('grid')} title='Display services as cards' icon='grid layout'/>
              <Button toggle active={display === 'list'} onClick={() => this.onChangeDisplay('list')} title='Display services as a list' icon='list layout'/>
            </Button.Group>
          </div>
        </div>
        <div className='containers'>
          {groupBy.value === '' && <ContainersView daemons={daemons || []} containers={containers || []} display={display} services={services} />}
          {groupBy.value !== '' && this.renderContainersGroupedBy(categories[groupBy.value] || [], containers || [], display, services || {}, daemons || [])}
        </div>
      </Form>
    );
  };
}

ContainersBox.propTypes = {
  containers: React.PropTypes.array,
  services: React.PropTypes.object,
  tags: React.PropTypes.object,
  daemons: React.PropTypes.array
};

export default ContainersBox;

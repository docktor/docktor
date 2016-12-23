// React
import React from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';

import { ALL_ROLES, getRoleData } from '../../../modules/auth/auth.constants.js';

// Style
import './category.card.scss';

// CategoryCard Component
class CategoryCard extends React.Component {

  constructor() {
    super();
    this.roles = {};
    ALL_ROLES.forEach(role => {
      this.roles[role] = getRoleData(role);
    });
  }

  componentDidMount() {
    const category = this.props.category;
    $(`#id-cat-${category.id} .with-title`).popup({
      delay: {
        show: 300,
        hide: 0
      }
    });
  }

  render() {
    const category = this.props.category;
    const onDelete = this.props.onDelete;
    const onEdit = this.props.onEdit;
    const tags = this.props.tags;
    return (
      <div className='ui card category' id={`id-cat-${category.id}`} >
        <div className='content'>
          <div className='header with-title' data-content={category.value} data-variation='inverted very wide'>{category.value}</div>
        </div>
        <div className='content'>
          {tags.map(tag => {
            let role = this.roles[tag.usageRights];
            let usageRightsClasses = classNames(
              {
                [role.icon]: !tag.isEditing,
                [role.color]: !tag.isEditing,
                'notched circle loading' : tag.isEditing
              },
              'with-title icon'
            );

            return (
              <div key={tag.name.slug} className={classNames('ui label', { 'disabled not-active': tag.isDeleting })}>
                <i className={usageRightsClasses} data-content={`Tag can be added or removed by role : ${role.value}`} data-position='left center' data-variation='inverted very wide'/>
                <a className={classNames({ 'disabled not-active': tag.isDeleting || tag.isEditing })} onClick={() => onEdit(tag)}>{tag.name.raw}</a>
                <i className={classNames('delete', { 'loading disabled not-active': tag.isDeleting }, 'icon')} onClick={() => onDelete(tag)}/>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

CategoryCard.propTypes = {
  category: React.PropTypes.object.isRequired,
  tags: React.PropTypes.array.isRequired,
  onDelete: React.PropTypes.func.isRequired,
  onEdit: React.PropTypes.func.isRequired
};

export default CategoryCard;

// React
import React from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';

import { AUTH_ADMIN_ROLE, ALL_ROLES, getRoleLabel, getRoleColor, getRoleIcon } from '../../../modules/auth/auth.constants.js';

// Style
import './category.card.scss';

// CategoryCard Component
class CategoryCard extends React.Component {

  componentDidMount() {
    $('.with-title').popup({
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
    const { tags } = category;

    return (
      <div className='ui card category'>
        <div className='content'>
          <div className='header'>{category.raw}</div>
        </div>
        <div className='content'>
          {tags.map(tag => {

            let usageRightsClasses = classNames(
              {
                [getRoleIcon(tag.usageRights)]: !tag.isEditing,
                [getRoleColor(tag.usageRights)]: !tag.isEditing,
                'notched circle loading' : tag.isEditing
              },
              'with-title icon'
            );

            return (
              <div key={tag.name.slug} className={classNames('ui label', { 'disabled not-active': tag.isDeleting })}>
                <i className={usageRightsClasses} data-content={'Tag can be added or removed by role : ' + getRoleLabel(tag.usageRights)} data-position='left center' data-variation='inverted very wide'/>
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
  onDelete: React.PropTypes.func.isRequired,
  onEdit: React.PropTypes.func.isRequired
};

export default CategoryCard;

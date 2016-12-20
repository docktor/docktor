// React
import React from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';

import { AUTH_ADMIN_ROLE, ALL_ROLES, getRoleLabel, getRoleColor, getRoleIcon } from '../../../modules/auth/auth.constants.js';

// Style
import './category.card.scss';

// CategoryCard Component
class CategoryCard extends React.Component {

  render() {
    const category = this.props.category;
    const onDelete = this.props.onDelete;
    const { tags } = category;

    return (
      <div className='ui card category'>
        <div className='content'>
          <div className='header'>{category.raw}</div>
        </div>
        <div className='content'>
          {tags.map(tag => {
            return (
              <div key={tag.name.slug} className={classNames('ui label', { 'disabled not-active': tag.isDeleting })}>
                <i className={classNames(getRoleIcon(tag.usageRights), getRoleColor(tag.usageRights), 'icon')}></i>
                <a className={classNames({ 'disabled not-active': tag.isDeleting })} onClick={() => console.log('test')}>{tag.name.raw}</a>
                <i className={classNames('delete', { 'loading disabled not-active': tag.isDeleting }, 'icon')} onClick={() => onDelete(tag)}></i>
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
  onDelete: React.PropTypes.func.isRequired
};

export default CategoryCard;

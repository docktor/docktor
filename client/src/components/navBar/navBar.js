// React
import React from 'react'
import { IndexLink, Link } from 'react-router';

// Style
import './navBar.scss'

// NavBar Component
const NavBar = () => (
    <div className='ui inverted fluid menu navbar'>
      <IndexLink to='/' className='item brand'>
        <i className='large fitted doctor icon'></i>{' '}Docktor
      </IndexLink>
      <Link to='/daemons' activeClassName='active' className='item'>Daemons</Link>
      <Link to='/groups' activeClassName='active' className='item'>Groups</Link>
      <Link to='/users' activeClassName='active' className='item'>Users</Link>
      <div className='right menu'>
        <a href='#' className='item'><i className='inverted large user icon'></i>{' '} Admin</a>
      </div>
    </div>
  )

export default NavBar

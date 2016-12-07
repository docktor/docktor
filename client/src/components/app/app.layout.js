// React
import React from 'react';

// JS dependancies
import 'jquery';
import form from 'semantic/dist/semantic.js';
$.form = form;

// Components
import NavBar from './navBar.component.js';
import Footer from './footer.component.js';
import Toasts from '../common/toasts/toasts.component.js';
import Modal from '../common/modal/modal.component.js';


// Style
import 'semantic/dist/semantic.css';
import './common.scss';
import './flex.scss';

// App Component
class App extends React.Component {
  render() {
    return (
      <div className='layout vertical start-justified fill'>
        <NavBar />
        <div className='flex main layout vertical'>
          {this.props.children}
        </div>
         <Toasts />
        <Modal />
      </div>
    );
  }
}
App.propTypes = { children: React.PropTypes.object };

export default App;

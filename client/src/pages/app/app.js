// React
import React from 'react'

// Components
import NavBar from '../../components/navBar/navBar.js'
import Footer from '../../components/footer/footer.js'
import Toasts from '../../components/toasts/toasts.js'
import Modal from '../../components/modal/modal.js'

// JS dependancies
import 'jquery'
import form from 'semantic/dist/semantic.js'
$.form = form

// Style
import 'semantic/dist/semantic.css'
import './app.scss'
import './flex.scss'

// App Component
class App extends React.Component {
  render() {
    return (
      <div className="layout vertical start-justified fill">
        <NavBar />
        <div className="flex main layout vertical">
          {this.props.children}
        </div>
         <Toasts />
        <Modal />
      </div>
    )
  }
}

export default App

// React
import React from 'react'

// Components
import NavBar from '../../components/navBar/navBar.js'
import Footer from '../../components/footer/footer.js'
import Toasts from '../../components/toasts/toasts.js'
import Modal from '../../components/modal/modal.js'

// Style
import './app.scss'
import '../../flex.scss'

// App Component
class App extends React.Component {
  render() {
    return (
      <div className="layout vertical center-center justified fill">
        <NavBar />
        <div className="main">
          <Toasts />
          {this.props.children}
        </div>
        <Modal />
        <Footer />
      </div>
    )
  }
}

export default App
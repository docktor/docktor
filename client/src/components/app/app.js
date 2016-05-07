import React from 'react'
import NavBar from '../navBar/navBar.js'
import Footer from '../footer/footer.js'

import './app.scss'
import '../../flex.scss'

class App extends React.Component {
  render() {
    return (
      <div className="layout vertical center-center justified fill">
        <NavBar />
        <div className="main">
          {this.props.children}
        </div>
        <Footer />
      </div>
    )
  }
}

export default App
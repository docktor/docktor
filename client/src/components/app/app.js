// React
import React from 'react'

// Components
import NavBar from '../navBar/navBar.js'
import Footer from '../footer/footer.js'
import Toasts from '../toasts/toasts.js'

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
        <Footer />
      </div>
    )
  }
}

export default App
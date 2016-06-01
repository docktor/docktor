// React
import React from 'react'
import { Map, TileLayer, Marker, Popup } from 'react-leaflet'

// Style
import 'semantic-ui-icon/icon.min.css'
import 'semantic-ui-item/item.min.css'
import 'semantic-ui-card/card.min.css'
import 'semantic-ui-label/label.min.css'
import 'semantic-ui-button/button.min.css'
import './daemon.scss'

// Daemon Component
class Daemon extends React.Component {

    render() {
        const daemon = this.props.daemon
        let site = this.props.site
        if (!site) {
            site = { Title: "unknown", Latitude: 45, Longitude: 0 }
        } 
        site.Zoom = 3

        return (
            <div className='daemon'>
      
                    <div className='ui card'>
                        <div className='content'>
                            <div className='header'><i className="server icon"></i>{' '}{daemon.Name}</div>
                            <div className='meta'>{daemon.Host}</div>
                            <div className='description'>{daemon.Description}</div>
                        </div>
                            <div className="ui bottom attached mini blue buttons">
                                <div className='ui button'>{' Images'}</div>
                                <div className='ui button'>{' Containers'}</div>
                                <div className="ui icon button">
                                    <i className="refresh icon"></i>
                                </div>
                            </div>
                    </div>
         
            </div>
        )
    }
}

export default Daemon
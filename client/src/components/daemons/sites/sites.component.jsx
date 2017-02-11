// React
import React from 'react';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import { connect } from 'react-redux';

// Actions for redux container
import SitesThunks from '../../../modules/sites/sites.thunks';
import ToastsActions from '../../../modules/toasts/toasts.actions';
import DaemonsActions from '../../../modules/daemons/daemons.actions';
import ModalActions from '../../../modules/modal/modal.actions';

// Style
import 'leaflet/dist/leaflet.css';
import './sites.component.scss';

//Site Component using react-leaflet
class SitesComponent extends React.Component {

  state = { lat: 45, lng: 5, zoom: 4 }

  componentDidUpdate = () => {
    setTimeout(() => {
      this.refs.sitesMap && this.refs.sitesMap.leafletElement.invalidateSize(false);
    }, 300); // Adjust timeout to tab transition
  }

  closePopup = () => {
    this.refs.sitesMap.leafletElement.closePopup();
  }

  render = () => {
    const { lat, lng, zoom } = this.state;
    const { sites, onDelete, onCreate, onEdit, changeFilter } = this.props;
    return (
      <div className='flex-2 self-stretch map-container layout horizontal center-center'>
        <Map ref='sitesMap' className='flex self-stretch map' center={[lat, lng]} zoom={zoom} onClick={(e) => onCreate(e.latlng)}>
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
            />
          {sites.map(site => {
            const sitePosition = [site.latitude, site.longitude];
            return (
              <Marker key={site.id} position={sitePosition}>
                <Popup>
                  <div>
                    {site.title}
                    <span className='popup-actions'>
                      <i onClick={() => changeFilter('site: ' + site.title)} className='teal search link icon' />
                      <i onClick={() => onEdit(site, this.closePopup)} className='blue write link icon' />
                      <i onClick={() => onDelete(site)} className='red trash link icon' />
                    </span>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </Map>
      </div>
    );
  }
}

SitesComponent.propTypes = {
  sites: React.PropTypes.array,
  onCreate: React.PropTypes.func,
  onEdit: React.PropTypes.func,
  onDelete: React.PropTypes.func,
  changeFilter: React.PropTypes.func
};


// Function to map state to container props
const mapStateToSitesProps = (state) => {
  return { sites: Object.values(state.sites.items) };
};

// Function to map dispatch to container props
const mapDispatchToSitesProps = (dispatch) => {
  return {
    onDelete: site => {
      const callback = () => dispatch(SitesThunks.delete(site));
      dispatch(ToastsActions.confirmDeletion(site.title, callback));
    },
    onCreate: position => {
      const callback = (siteForm) => dispatch(SitesThunks.save(siteForm));
      dispatch(ModalActions.openNewSiteModal(position, callback));
    },
    onEdit: (site, closePopup) => {
      const callback = (siteForm) => {
        closePopup();
        dispatch(SitesThunks.save(siteForm));
      };
      dispatch(ModalActions.openEditSiteModal(site, callback));
    },
    changeFilter: (filterValue) => dispatch(DaemonsActions.changeFilter(filterValue))
  };
};

// Redux container to Sites component
const Sites = connect(
  mapStateToSitesProps,
  mapDispatchToSitesProps
)(SitesComponent);

export default Sites;

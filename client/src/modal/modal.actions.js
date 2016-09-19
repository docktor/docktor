// import constants
import ModalConstants from './modal.constants.js';

// Close Modal
const closeModal = () => {
  return {
    type: ModalConstants.CLOSE_MODAL
  };
};

// New Site Modal
const openNewSiteModal = (position, callback) => {
  let form = { lines: [], hidden: [] };
  let line = { class: 'three', fields: [] };
  line.fields.push({ label: 'Title', name: 'title', desc: 'Site Title', type: 'text', required: true });
  line.fields.push({ label: 'Latitude', name: 'latitude', desc: 'Site Latitude', value: Math.round(position.lat * 10000) / 10000, type: 'number', required: true });
  line.fields.push({ label: 'Longitude', name: 'longitude', desc: 'Site Longitude', value: Math.round(position.lng * 10000) / 10000, type: 'number', required: true });
  form.lines.push(line);
  return {
    type: ModalConstants.OPEN_MODAL,
    title: 'New Site',
    form,
    callback
  };
};

// Edit Site Modal
const openEditSiteModal = (site, callback) => {
  let form = { lines: [], hidden: [] };
  let line = { class: 'three', fields: [] };
  line.fields.push({ label: 'Title', name: 'title', desc: 'Site Title', value: site.title, type: 'text', required: true });
  line.fields.push({ label: 'Latitude', name: 'latitude', desc: 'Site Latitude', value: site.latitude, type: 'number', required: true });
  line.fields.push({ label: 'Longitude', name: 'longitude', desc: 'Site Longitude', value: site.longitude, type: 'number', required: true });
  form.lines.push(line);

  form.hidden.push({ name: 'id', value: site.id });
  form.hidden.push({ name: 'created', value: site.created });
  return {
    type: ModalConstants.OPEN_MODAL,
    title: 'Edit Site',
    form,
    callback
  };
};

export default {
  closeModal,
  openNewSiteModal,
  openEditSiteModal
};

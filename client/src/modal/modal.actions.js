// Close Modal
export const CLOSE_MODAL = 'CLOSE_MODAL';

export function closeModal() {
  return {
    type: CLOSE_MODAL
  };
}

// Site Modal
export const OPEN_MODAL = 'OPEN_MODAL';

export function openNewSiteModal(position, callback) {
  let form = { lines: [], hidden: [] };
  let line = { class: 'three', fields: [] };
  line.fields.push({ label: 'Title', name: 'title', desc: 'Site Title', type: 'text', required: true });
  line.fields.push({ label: 'Latitude', name: 'latitude', desc: 'Site Latitude', value: Math.round(position.lat * 100) / 100, type: 'number', required: true });
  line.fields.push({ label: 'Longitude', name: 'longitude', desc: 'Site Longitude', value: Math.round(position.lng * 100) / 100, type: 'number', required: true });
  form.lines.push(line);
  return {
    type: OPEN_MODAL,
    title: 'New Site',
    form,
    callback
  };
}

export function openEditSiteModal(site, callback) {
  let form = { lines: [], hidden: [] };
  let line = { class: 'three', fields: [] };
  line.fields.push({ label: 'Title', name: 'title', desc: 'Site Title', value: site.title, type: 'text', required: true });
  line.fields.push({ label: 'Latitude', name: 'latitude', desc: 'Site Latitude', value: site.latitude, type: 'number', required: true });
  line.fields.push({ label: 'Longitude', name: 'longitude', desc: 'Site Longitude', value: site.longitude, type: 'number', required: true });
  form.lines.push(line);

  form.hidden.push({ name: 'id', value: site.id });
  form.hidden.push({ name: 'created', value: site.created });
  return {
    type: OPEN_MODAL,
    title: 'Edit Site',
    form,
    callback
  };
}

// React
import React from 'react';

import Box from './box/box.component.js';

// JobsBox is a list of jobs
class JobsBox extends React.Component {

  constructor(props) {
    super(props);

    // Set state of component from the props.
    this.state = { jobs: this.props.jobs || [] };
  }

  isFormValid() {
    return this.refs.jobsBox.isFormValid();
  }

  onChangeJobs(jobs) {
    this.state.jobs = jobs;
  }

  render() {
    const form = { fields:[] };

    form.getTitle = (job) => {
      return '';
    };

    form.fields.push({
      name: 'name',
      label: 'Name',
      placeholder: 'Job Name',
      class: 'three wide',
      required: true
    });

    form.fields.push({
      name: 'value',
      label: 'Value',
      placeholder: 'Job Value',
      class: 'three wide',
      required: true
    });

    form.fields.push({
      name: 'interval',
      label: 'Interval',
      placeholder: 'Job Interval',
      class: 'three wide',
      required: true
    });

    form.fields.push({
      name: 'type',
      label: 'Type',
      placeholder: 'Select a type',
      class: 'three wide',
      required: true,
      options: [
        { value:'url', name:'HTTP Job' },
        { value:'exec', name:'Exec Job' }
      ],
      type: 'select'
    });

    form.fields.push({
      name: 'description',
      label: 'Description',
      placeholder: 'Describe this Job',
      class: 'three wide',
      type: 'textarea',
      rows: 2
    });

    return (
      <Box
        ref='jobsBox'
        boxId={this.props.boxId}
        icon='large checked calendar icon'
        title='Jobs' form={form}
        lines={this.props.jobs}
        stacked={this.props.stacked}
        onChange={jobs => this.onChangeJobs(jobs)}>
        {this.props.children || ''}
      </Box>
    );
  }
}

JobsBox.propTypes = {
  boxId: React.PropTypes.string,
  jobs: React.PropTypes.array,
  stacked: React.PropTypes.bool,
  children: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.element
  ])
};

export default JobsBox;

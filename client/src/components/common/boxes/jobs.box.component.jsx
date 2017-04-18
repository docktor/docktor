// React
import React from 'react';

import Box from './box/box.component';

// JobsBox is a list of jobs
class JobsBox extends React.Component {

  state = { jobs: [] }

  componentWillMount = () => {
    this.setState({ jobs: this.props.jobs });
  }

  componentWillReceiveProps = (nextProps) => {
    this.setState({ jobs: nextProps.jobs });
  }

  isFormValid = () => {
    return this.refs.jobsBox.isFormValid();
  }

  onChangeJobs = (jobs) => {
    this.state.jobs = jobs;
  }

  render = () => {
    const form = { fields:[] };

    form.getTitle = () => {
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
        icon='checked calendar'
        title='Jobs' form={form}
        lines={this.props.jobs}
        stacked={this.props.stacked}
        onChange={this.onChangeJobs}>
        {this.props.children || ''}
      </Box>
    );
  }
}

JobsBox.propTypes = {
  jobs: React.PropTypes.array,
  stacked: React.PropTypes.bool,
  children: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.element
  ])
};

export default JobsBox;

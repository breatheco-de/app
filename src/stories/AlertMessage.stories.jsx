import React from 'react';
import AlertMessage from '../common/components/AlertMessage';

export default {
    title: 'Components/AlertMessage',
    component: AlertMessage,
    argTypes: {
      message: {
        control: 'string'
      },
      type: {
        options: ['warning', 'success', 'error', 'info'],
        control: 'select',
      },
      style: {
        control: 'object'
      },
      textStyle: {
        control: 'object'
      },
      full: {
        control: 'boolean'
      },
    }
  };
  
  const Component = (args) => (
    <AlertMessage {...args} />
  );
  export const Default = Component.bind({});
  Default.args = {
    type: 'warning',
    style: {},
    textStyle: {},
    full: false,
  };
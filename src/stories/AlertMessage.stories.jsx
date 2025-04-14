import React from 'react';
import AlertMessage from '../components/AlertMessage';

export default {
    title: 'Components/AlertMessage',
    component: AlertMessage,
    argTypes: {
      message: {
        control: {
          type: 'text'
        }
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
    message: 'Example Alert Message',
    style: {},
    textStyle: {},
    full: false,
    textColor: '#000'
  };
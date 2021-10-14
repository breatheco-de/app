import React from 'react';
import HoldButton from '../common/components/HoldButton';

export default {
  title: 'Components/HoldButton',
  component: HoldButton,
  argTypes: {
    progressBorder: {
      control:{
        type: 'color',
      }
    },
    borderRadius: {
      control: {
        type: 'range',
        min: 0,
        max: 50,
    },
  }
  },
};

const Component = (args) => <HoldButton {...args} borderRadius={`${args.borderRadius}px`} />;

export const Default = Component.bind({});
Default.args = {
  text: 'Submit',
  progressBorder: '#646b8c',
  background: '#2b3044',
  borderRadius: 14,
  successIconColor: '#25BF6C',
};

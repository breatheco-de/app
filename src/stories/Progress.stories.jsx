import React from 'react';
import Progress from '../components/ProgressBar/Progress';

export default {
  title: 'Components/Progress',
  component: Progress,
  argTypes: {
    percents: {
      control: {
        type: 'range',
        min: 0,
        max: 100,
      },
    },
    duration: {
      control: 'number',
    },
    delay: {
      control: 'number',
    },
    easing: {
      options: ['linear', 'easeIn', 'easeOut', 'easeInOut', 'circIn', 'circOut', 'circInOut', 'backIn', 'backOut', 'backInOut', 'anticipate'],
      control: 'select',
    },
    barHeight: {
      control: 'number',
    }
  },
};

const Component = (args) => {
  return <Progress barHeight={`${args.barHeight}px`} {...args} />
};

export const Default = Component.bind({});
Default.args = {
  percents: 10,
  duration: 2,
  delay: 0.5,
  easing: 'easeInOut',
  barHeight: 4,
  borderRadius: '35px'
};

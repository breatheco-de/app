import React from 'react';
import ProgressBar from '../common/components/ProgressBar';

export default {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  argTypes: {
    width: {
      control: {
        type: 'range',
        min: 0,
        max: 100,
      },
    },
  },
};

const Component = (args) => (
  <ProgressBar {...args} width={`${args.width}%`} />
);
export const Default = Component.bind({});
Default.args = {
  programs: [
    {
      title: 'Lessons',
      Icon: 'book',
      taskLength: 30,
      taskCompleted: 12,
    },
    {
      title: 'Projects',
      icon: 'book',
      taskLength: 15,
      taskCompleted: 5,
    },
    {
      title: 'Exercises',
      icon: 'book',
      taskLength: 15,
      taskCompleted: 5,
    },
  ],
  progressText: 'progress in the program',
};

import React from 'react';
import { action } from '@storybook/addon-actions';
import { withKnobs } from '@storybook/addon-knobs';
import Timeline from '../common/components/Timeline';

export default {
  title: 'Components/Timeline',
  component: Timeline,
  argTypes: {
    width: {
      control: {
        type: 'range',
        min: 0,
        max: 100,
      },
    },
  },
  decorators: [withKnobs],
};

const Component = (args) => <Timeline {...args} width={`${args.width}%`} />;

export const Default = Component.bind({});
Default.args = {
  title: '<HTML/CSS>',
  onClickAssignment: (e, item) => {
    action(`onClickAssignment: ${JSON.stringify(item, null, 4)}`)(e);
  },
  width: 100,
  assignments: [
    {
      id: 1,
      title: 'Read',
      subtitle: 'Introduction to prework',
      icon: 'book',
      muted: true,
    },
    {
      id: 2,
      title: 'Read',
      subtitle: 'Introduction to prework',
      icon: 'book',
      muted: false,
    },
    {
      id: 3,
      title: 'Read',
      subtitle: 'Introduction to prework',
      icon: 'book',
      muted: false,
    },
    {
      id: 4,
      title: 'Read',
      subtitle: 'Introduction to prework',
      icon: 'book',
      muted: false,
    },
    {
      id: 5,
      title: 'Read',
      subtitle: 'Introduction to prework',
      icon: 'book',
      muted: false,
    },
    {
      id: 6,
      title: 'Read',
      subtitle: 'Introduction to prework',
      icon: 'book',
      muted: false,
    },
    {
      id: 7,
      title: 'Read',
      subtitle: 'Introduction to prework',
      icon: 'book',
      muted: false,
    },
    {
      id: 8,
      title: 'Read',
      subtitle: 'Introduction to prework',
      icon: 'book',
      muted: false,
    },
  ],
};

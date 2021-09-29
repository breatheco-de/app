import React from 'react';

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
  }
};

const Component = (args) => <Timeline {...args} width={`${args.width}%`}/>;

export const Default = Component.bind({});
Default.args = {
  title: "<HTML/CSS>",
  width: 100,
  lessons: [
    {
      id: 1,
      title: "Read",
      subtitle: "Introduction to prework",
      icon: "book"
    },
    {
      id: 2,
      title: "Read",
      subtitle: "Introduction to prework",
      icon: "book"
    },
    {
      id: 3,
      title: "Read",
      subtitle: "Introduction to prework",
      icon: "book"
    },
    {
      id: 4,
      title: "Read",
      subtitle: "Introduction to prework",
      icon: "book"
    }
  ]
};

import React from 'react';

import ModuleMap from '../common/components/ModuleMap';

export default {
  title: 'Components/ModuleMap',
  component: ModuleMap,
  argTypes: {
    modules: {
      control: { type: 'object' },
    },
  },
};

const Component = (args) => <ModuleMap {...args} />;

export const Default = Component.bind({});
Default.args = {
  // moduleNumber: 1,
  // title: 'READ',
  // paragraph: 'Introduction to the pre-work',
  width: '40%',
  // icon: 'book',
  modules: [
    {
      title: 'Read',
      paragraph: 'Introduction to the pre-work',
      number: 1,
      icon: 'verified',
    },
    {
      title: 'Practice',
      paragraph: 'Practice pre-work',
      number: 2,
      icon: 'book',
    },
    {
      title: 'Practice',
      paragraph: 'Star wars',
      number: 3,
      icon: 'verified',
    },
    {
      title: 'Practice',
      paragraph: 'test',
      number: 4,
      icon: 'verified',
    },
  ],
};

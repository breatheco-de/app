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
  width: '40%',
  modules: [
    {
      title: 'Read',
      text: 'Introduction to the pre-work',
      icon: 'verified',
    },
    {
      title: 'Practice',
      text: 'Practice pre-work',
      icon: 'book',
    },
    {
      title: 'Practice',
      text: 'Star wars',
      icon: 'verified',
    },
    {
      title: 'Practice',
      text: 'test',
      icon: 'verified',
    },
  ],
};

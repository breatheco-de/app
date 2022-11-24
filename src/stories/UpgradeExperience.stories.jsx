import React from 'react';

import UpgradeExperience from '../common/components/UpgradeExperience';

export default {
  title: 'Components/UpgradeExperience',
  component: UpgradeExperience,
  argTypes: {
    data: {
      control: 'array'
    },
  },
};

const Component = (args) => <UpgradeExperience {...args} />;

export const Default = Component.bind({});
Default.args = {
  data: [
    {
      label: 'Intro to coding',
      src: '/intro-to-coding',
    },
    {
      label: 'Data Science',
      src: '/data-science',
    },
    {
      label: 'A.I & Machine Learning',
      src: '/ai-machine-learning',
    }
  ],
};

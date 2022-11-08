import React from 'react';

import UpgradeAccessModal from '../common/components/UpgradeAccessModal';

export default {
  title: 'Components/UpgradeAccessModal',
  component: UpgradeAccessModal,
  argTypes: {
    isOpen: {
      control: 'boolean'
    },
  },
};

const Component = (args) => <UpgradeAccessModal storySettings={{...args}} />;

export const Default = Component.bind({});
Default.args = {
  isOpen: true,
};

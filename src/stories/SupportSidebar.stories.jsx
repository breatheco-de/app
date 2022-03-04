import React from 'react';
import SupportSidebar from '../common/components/SupportSidebar';

export default {
  title: 'Components/SupportSidebar',
  component: SupportSidebar,
  argTypes: {
    actionButtons: {
      control: { type: 'object' },
    },
  },
};

const Component = (args) => <SupportSidebar {...args} />;

export const Default = Component.bind({});
Default.args = {
  title: 'Don’t Get Stuck',
  subtitle: 'Did you know you can schedule mentoring sessions any time or ask in the Support Chat?',
  actionButtons: [
    {
      title: 'SCHEDULE MENTORING',
      icon: 'conversation',
    },
    {
      title: 'ASK IN SUPPORT CHAT',
      icon: 'slack',
    },
  ],
};

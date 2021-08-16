import React from 'react';

import TagCapsule from '../common/components/TagCapsule';

export default {
  title: 'Components/TagCapsule',
  component: TagCapsule,
  argTypes: {
    tags: {
      control: { type: 'object' },
    },
  },
};

const Component = (args) => <TagCapsule {...args} />;

export const Default = Component.bind({});
Default.args = {
  tags: [
    {
      name: 'html',
    },
    {
      name: 'css',
    },
    {
      name: 'javascript',
    },
    {
      name: 'react',
    },
    {
      name: 'python',
    },
  ],
  separator: '/',
};

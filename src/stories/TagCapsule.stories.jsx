import React from 'react';

import TagCapsule from '../components/TagCapsule';

export default {
  title: 'Components/TagCapsule',
  component: TagCapsule,
  argTypes: {
    tags: {
      control: { type: 'object' },
    },
    variant: {
      control: 'select',
      options: ['slash', 'rounded'],
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
  variant: 'slash',
};

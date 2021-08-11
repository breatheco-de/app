import React from 'react';
import Navbar from '../common/components/navbar';

export default {
  title: 'Components/Navbar',
  component: Navbar,
  argTypes: {
  },
};

const Component = (args) => <Navbar {...args} />;

export const Default = Component.bind({});
Default.args = {
  title: "Example"
};
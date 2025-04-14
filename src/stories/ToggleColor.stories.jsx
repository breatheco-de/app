import React from 'react';

import ToggleColor from '../components/ToggleColor';

export default {
  title: 'Components/ToggleColor',
  component: ToggleColor,
  argTypes: {},
};

const Component = (args) => <ToggleColor {...args} />;

export const Default = Component.bind({});
Default.args = {
  title: 'Example',
};

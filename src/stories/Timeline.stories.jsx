import React from 'react';

import Timeline from '../common/components/Timeline';

export default {
  title: 'Components/Timeline',
  component: Timeline,
  argTypes: {},
};

const Component = (args) => <Timeline {...args} />;

export const Default = Component.bind({});
Default.args = {
  title: "<HTML/CSS>",
};

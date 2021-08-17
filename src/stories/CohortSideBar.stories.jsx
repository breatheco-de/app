import React from 'react';
import CohortSideBar from '../common/components/CohortSideBar';

export default {
  title: 'Components/CohortSideBar',
  component: CohortSideBar,
  argTypes: {
  },
};

const Component = (args) => <CohortSideBar {...args} />;

export const Default = Component.bind({});
Default.args = {
  title: "Example"
};
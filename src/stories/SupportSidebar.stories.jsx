import React from 'react';

import SupportSidebar from '../common/components/supportSidebar';

export default {
  title: 'Components/SupportSidebar',
  component: SupportSidebar,
  argTypes: {
    // icon: {
    //   control: { type: 'select' },
    //   options: ['book', 'verified']
    // },
    // moduleNumber: {
    //   control: { type: 'range', min: 0, max: 150 },
    // }
  },
};

const Component = (args) => <SupportSidebar {...args} />;

export const Default = Component.bind({});
Default.args = {
  title: "Example",
  // title: 'READ',
  // paragraph: 'Introduction to the pre-work',
  // width: '40%',
  // icon: 'book'
};

import React from 'react';

import ToggleColor from '../common/components/toggleColor';

export default {
  title: 'Components/ToggleColor',
  component: ToggleColor,
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

const Component = (args) => <ToggleColor {...args} />;

export const Default = Component.bind({});
Default.args = {
  title: "Example",
  // title: 'READ',
  // paragraph: 'Introduction to the pre-work',
  // width: '40%',
  // icon: 'book'
};

// export const Secondary = Template.bind({});
// Secondary.args = {
//   label: 'Button',
// };

// export const Large = Template.bind({});
// Large.args = {
//   size: 'large',
//   label: 'Button',
// };

// export const Small = Template.bind({});
// Small.args = {
//   size: 'small',
//   label: 'Button',
// };

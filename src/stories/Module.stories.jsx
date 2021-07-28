import React from 'react';

import Modules from './components/Module';

export default {
  title: 'Components/Module',
  component: Modules,
  argTypes: {
    icon: {
      control: { type: 'select' },
      options: ['book', 'verified']
    },
    moduleNumber: {
      control: { type: 'range', min: 0, max: 150 },
    }
  },
};

const Component = (args) => <Modules {...args} />;

export const Default = Component.bind({});
Default.args = {
  moduleNumber: 1,
  title: 'READ',
  paragraph: 'Introduction to the pre-work',
  width: '40%',
  icon: 'book'
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

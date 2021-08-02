import React from 'react';

import { Button } from '@chakra-ui/react';

export default {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      options: ['default', 'black', 'outline'],
      control: 'select',
    },
    disabled: {
      control: 'boolean',
    }
  },
};

const Template = (args) => <Button {...args} >Example</Button>;

export const Default = Template.bind({});
Default.args = {
  variant: 'default',
  disabled: false
};

export const Black = Template.bind({});
Black.args = {
  variant: 'black',
  disabled: false
};

export const Outline = Template.bind({});
Outline.args = {
  variant: 'outline',
  disabled: false
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

import React from 'react';

import { Button } from '@chakra-ui/react';

export default {
  title: 'Components/Button',
  component: Button,
  // tags: ['autodocs'],
  argTypes: {
    variant: {
      options: ['default', 'black', 'outline'],
      control: 'select',
    },
    disabled: {
      control: 'boolean',
    },
  },
};

// const Template = (args) => <Button {...args}>Example</Button>;
export const Default = (args) => <Button {...args}>Example</Button>;
Default.args = {
  variant: 'default',
  disabled: false,
};

export const Black = (args) => <Button {...args}>Example</Button>;
Black.args = {
  variant: 'black',
  disabled: false,
}

export const Outline = (args) => <Button {...args}>Example</Button>;
Outline.args = {
  variant: 'outline',
  disabled: false,
}

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

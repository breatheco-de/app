import React from 'react';
import StickySideBar from '../common/components/StickySideBar';
import { action } from '@storybook/addon-actions';
import { withKnobs } from "@storybook/addon-knobs";

export default {
  title: 'Components/StickySideBar',
  component: StickySideBar,
  argTypes: {
    width: {
      control: {
        type: 'range',
        min: 0,
        max: 100,
      },
    },
  },
  decorators:[withKnobs]
};

const Component = (args) =>{
    return  <StickySideBar {...args} width={`${args.width}%`} />
};

export const Default = Component.bind({});
Default.args = {
  onClickMenuItem: (e, item) => {
    action('onClickMenuItem: ' + JSON.stringify(item, null, 4))(e)
  },
  width:100,
  menu:[
    {
      icon: 'book',
      text: 'Student Mode',
      id: 1,
    },
    {
      icon: 'key',
      text: 'Key Concepts',
      id: 2,
    },
    {
      icon: 'replits',
      text: 'Replits',
      id: 3,
    },
    {
      icon: 'assignments',
      text: 'Assignments',
      id: 4,
    },
  ]
};
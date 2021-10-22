import React from 'react';
import StickySideBar from '../common/components/StickySideBar';
import { action } from '@storybook/addon-actions';
import { withKnobs } from "@storybook/addon-knobs";

export default {
  title: 'Components/StickySideBar',
  component: StickySideBar,
  argTypes: {
  },
  decorators:[withKnobs]
};

const Component = (args) =>{
    return  <StickySideBar />
};

export const Default = Component.bind({});
Default.args = {

};
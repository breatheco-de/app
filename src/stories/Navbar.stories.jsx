import React, {useState} from 'react';
import Navbar from '../common/components/Navbar';
import { text, withKnobs, boolean } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';


export default {
  title: 'Components/Navbar',
  component: Navbar,
  argTypes: {
  },
  decorators: [withKnobs],
};

const Component = (args) => {
  return  <Navbar {...args}/>
};

export const Default = Component.bind({});
Default.args = {
  menuList: [
    {
      icon: "home",
      title: "Dashboard",
      link: "/"
    },
    {
      icon: "book",
      title: "Learn",
      link: "/learn"
    },
    {
      icon: "message",
      title: "Mentoring",
      link: "/mentoring"
    },
    {
      icon: "people",
      title: "Community",
      link: "/community"
    },
  ],
  user: {
    avatar: text("Avatar","https://storage.googleapis.com/media-breathecode/639857ed0ceb0a5e5e0429e16f7e3a84365270a0977fb94727cc3b6450d1ea9a"),
    handleUser: action("handleUser"),
    notifies: boolean("Notifies", false),
  },
  handleChange: action("handleChange"),
};
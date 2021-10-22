import React from 'react';
import Navbar from '../../common/components/Navbar/Session';
import { action } from '@storybook/addon-actions';


export default {
  title: 'Components/Navbar/Session',
  component: Navbar,
  argTypes: {
    user: {
      control: {
        type: 'object'
      }
    },
    width: {
      control: {
        type: 'range',
        min: 0,
        max: 100,
    },
  },
  }
};

const Component = (args) => {
  return <Navbar {...args} width={`${args.width}%`}  />
};

export const Default = Component.bind({});
Default.args = {
  width: 100,
  handleChange: action('onChange'),
  onClickNotifications: action('onClickNotifications'),
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
    avatar: "https://storage.googleapis.com/media-breathecode/639857ed0ceb0a5e5e0429e16f7e3a84365270a0977fb94727cc3b6450d1ea9a",
    onClickUser: action('onClickUser'),
    notifies: true,
  },
};
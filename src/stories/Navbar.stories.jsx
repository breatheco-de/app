import React from 'react';
import Navbar from '../common/components/navbar';

export default {
  title: 'Components/Navbar',
  component: Navbar,
  argTypes: {
  },
};

const Component = (args) => <Navbar {...args} />;

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
    avatar: "https://storage.googleapis.com/media-breathecode/639857ed0ceb0a5e5e0429e16f7e3a84365270a0977fb94727cc3b6450d1ea9a",
    handleUser: () => {
    },
    notifies:false
  },
};
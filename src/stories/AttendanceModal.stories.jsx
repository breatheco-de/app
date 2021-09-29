import React from 'react';
import AttendanceModal from '../common/components/AttendanceModal';

export default {
  title: 'Components/AttendanceModal',
  component: AttendanceModal,
  argTypes: {
    width: {
      control: {
        type: 'range',
        min: 0,
        max: 100,
      },
    },
  }
};

const Component = (args) => <AttendanceModal {...args} width={`${args.width}%`} />;

export const Default = Component.bind({});
Default.args = {
  title: "Start your today’s class",
  width: 100,
  days: [
    {
      id: 1,
      title: "Read",
      subtitle: "Introduction to prework",
      icon: "book"
    },
    {
      id: 2,
      title: "Read",
      subtitle: "Introduction to prework",
      icon: "book"
    },
    {
      id: 3,
      title: "Read",
      subtitle: "Introduction to prework",
      icon: "book"
    },
    {
      id: 4,
      title: "Read",
      subtitle: "Introduction to prework",
      icon: "book"
    }
  ],
  attendance: [
    {
      id: 1,
      'active': true,
      'image': 'https://bit.ly/kent-c-dodds',
      'name': 'Jhon benavides',
    },
    {
      id: 2,
      'active': false,
      'image': 'https://bit.ly/ryan-florence',
      'name': 'Alex door',
    },
    {
      id: 3,
      'active': false,
      'image': 'https://bit.ly/sage-adebayo',
      'name': 'Jeff toreto',
    },
    {
      id: 4,
      'active': true,
      'image': 'https://bit.ly/code-beast',
      'name': 'Doe philips',
    },
    {
      id: 5,
      'active': false,
      'image': 'https://bit.ly/prosper-baba',
      'name': 'Harry smith',
    },
  ]
};
import React, {useEffect} from 'react';
import AttendanceModal from '../common/components/AttendanceModal';
import { useDisclosure } from '@chakra-ui/hooks';
import { action } from '@storybook/addon-actions';
import { withKnobs } from "@storybook/addon-knobs";

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
  },
  decorators:[withKnobs]
};

const Component = (args) =>{
  const { isOpen, onClose, onOpen } = useDisclosure();
  useEffect(()=> onOpen(), [])
  return isOpen ? <AttendanceModal {...args} isOpen={isOpen} onClose={onClose} width={`${args.width}%`} /> : <></>
  };

export const Default = Component.bind({});
Default.args = {
  title: "Start your today’s class",
  message: "Hello Paolo, today is 27th of July and the cohort started taking classes on Monday Jun 10th. Please, select your today module.",
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
  ],
  onSubmit: (e, checked) => {
    action('clicked' + JSON.stringify(checked, null, 4))(e)
  },
  onChangeDay: (e) => {
    action('change day')(e)
  }
};
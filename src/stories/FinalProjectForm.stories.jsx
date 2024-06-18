import React from 'react';
import { Box } from '@chakra-ui/layout';
import FinalProjectModal from '../common/components/FinalProject/Modal';

export default {
  title: 'Components/FinalProjectModal',
  component: FinalProjectModal,
  argTypes: {},
};

const Template = (args) => {
  console.log('args', args) 
  return (
  <Box width={`${args.width}%`}>
    <FinalProjectModal {...args} />
  </Box>
)};

export const Default = Template.bind({});
Default.args = {
  isOpen: true,
  cohortData: {
    slug: 'miami-xxix',
    academy: 4,
  },
  studentsData: [
    {
      "id": 123,
      "user": {
        "id": 91,
        "first_name": "Jhon",
        "last_name": "Doe",
        "full_name": "Jhon Doe",
        "email": "JhonDoe@gmail.com"
      },
      "role": "STUDENT",
      "finantial_status": null,
      "educational_status": null,
      "created_at": "2020-11-09T17:02:33.773000Z"
    },
    {
      "id": 123,
      "user": {
        "id": 189,
        "first_name": "Peter",
        "last_name": "Parker",
        "full_name": "Peter Parker",
        "email": "PeterParker@gmail.com"
      },
      "role": "STUDENT",
      "finantial_status": null,
      "educational_status": null,
      "created_at": "2020-11-09T17:02:33.773000Z"
    },
    {
      "id": 321,
      "user": {
        "id": 919,
        "first_name": "Jhonny",
        "last_name": "Doe",
        "full_name": "Jhonny Doe",
        "email": "Jhonny@gmail.com"
      },
      "role": "TEACHER",
      "finantial_status": null,
      "educational_status": null,
      "created_at": "2020-11-09T17:02:34.279000Z"
    }
  ]
};

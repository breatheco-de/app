import React from 'react';
import { Box } from '@chakra-ui/layout';
import FinalProject from '../common/components/FinalProject';

export default {
  title: 'Components/FinalProject',
  component: FinalProject,
  argTypes: {
    totalTasks: {
      control: {
        type: 'number',
        min: 100,
        max: 100,
      },
    },
    completedTasks: {
      control: {
        type: 'number',
        min: 0,
        max: 100,
      },
    },
  },
};

const Template = (args) => {
  console.log('args', args) 
  return (
  <Box>
    <FinalProject
      storyConfig={{
        completedTasks: args?.completedTasks,
        totalTasks: args?.totalTasks,
        width: args?.width,
        approved: args?.approved,
        syllabusName: args?.syllabusName,
      }}
    />
  </Box>
)};

export const Default = Template.bind({});
Default.args = {
  cohortData: {
    slug: 'miami-xxix',
    academy: 4,
  },
  completedTasks: 33,
  totalTasks: 100,
  width: '370px',
  approved: true,
  syllabusName: 'Full Stack Engineer',
};

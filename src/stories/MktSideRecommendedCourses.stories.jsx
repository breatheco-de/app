import React from 'react';
import MktSideRecommendedCourses from '../common/components/MktSideRecommendedCourses';
import { Box } from '@chakra-ui/react';

export default {
  title: 'Components/MktSideRecommendedCourses',
  component: MktSideRecommendedCourses,
  argTypes: {},
};

const Component = (args) => {
  return (
    <Box width={args.width}>
      <MktSideRecommendedCourses {...args} />
    </Box>
  )
};

export const Default = Component.bind({});
Default.args = {
  width: '350px',
  title: 'Title',
  endpoint: '/v1/marketing/course'
};

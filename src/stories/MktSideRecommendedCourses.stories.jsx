import React from 'react';
import MktSideRecommendations from '../common/components/MktSideRecommendations';
import { Box } from '@chakra-ui/react';

export default {
  title: 'Components/MktSideRecommendations',
  component: MktSideRecommendations,
  argTypes: {},
};

const Component = (args) => {
  return (
    <Box width={args.width}>
      <MktSideRecommendations {...args} />
    </Box>
  )
};

export const Default = Component.bind({});
Default.args = {
  width: '350px',
  title: 'Title',
  endpoint: '/v1/marketing/course'
};

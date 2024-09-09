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
  title: 'Course Recommendations',
  endpoint: '/v1/marketing/course',
};

export const Tutorials = Component.bind({});
Tutorials.args = {
  width: '350px',
  title: 'Asset Recommendation',
  endpoint: '/v1/marketing/course',
  technologies: [
    {
      description: "",
      icon_url: null,
      is_deprecated: false,
      slug: "apis",
      title: "APIs",
      visibility: "PUBLIC",
    },
    {
      description: "",
      icon_url: "https://storage.googleapis.com/breathecode/logos-technologias/Flask.png",
      is_deprecated: false,
      slug: "flask",
      title: "Flask",
      visibility: "PUBLIC",
    }
  ],
};
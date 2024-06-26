import React from 'react';
import DynamicContentCard from '../common/components/DynamicContentCard';
import { types } from '../common/components/DynamicContentCard/card-types';
import { BREATHECODE_HOST } from '../utils/variables';
import { Box } from '@chakra-ui/react';

export default {
  title: 'Components/DynamicContentCard',
  component: DynamicContentCard,
  argTypes: {}
};

const usersWorkedHere = [{
  id: 1,
  first_name: 'John',
  last_name: 'Doe',
  profile: {
    avatar_url: ''
  }
}, {
  id: 2,
  first_name: 'Jane',
  last_name: 'Doe',
  profile: {
    avatar_url: ''
  }
}, {
  id: 3,
  first_name: 'Alice',
  last_name: 'Doe',
  profile: {
    avatar_url: ''
  }
}, {
  id: 4,
  first_name: 'Bob',
  last_name: 'Doe',
  profile: {
    avatar_url: ''
  }
}, {
  id: 5,
  first_name: 'Eve',
  last_name: 'Doe',
  profile: {
    avatar_url: ''
  }
}, {
  id: 6,
  first_name: 'Mallory',
  last_name: 'Doe',
  profile: {
    avatar_url: ''
  }
}];
const technologies = [{
  title: 'Html',
  icon_url: 'https://svgl.app/library/html5.svg'
}, {
  title: 'React',
  icon_url: 'https://svgl.app/library/react.svg'
}, {
  title: 'Javascript',
  icon_url: 'https://svgl.app/library/javascript.svg'
}];
const defaultData = {
  duration: 5,
  title: 'Intro to Professional and Agile Development',
  lang: 'en',
  slug: 'intro-to-professional-and-agile-development',
  starting_at: '2024-06-18T22:00:00Z',
  ending_at: '2024-06-18T23:30:00Z',
  excerpt: 'All you\'ve learned needs to be put together. Lets make our first entire professional application using the Agile Development method!',
  gitpod: true,
  solution_url: 'https://www.youtube.com/watch?v=BpxptN4ytjA',
  intro_video_url: 'https://www.youtube.com/watch?v=BpxptN4ytjA',
  difficulty: 'hard',
};

const Component = (args, context) => {
  return (
    <Box maxWidth="410px">
      <DynamicContentCard {...args} />
    </Box>
  )
};

export const Default = Component.bind({});
Default.args = {
  type: types.lesson,
  data: defaultData,
  technologies,
};

export const Exercise = Component.bind({});
Exercise.args = {
  type: types.exercise,
  data: defaultData,
  technologies,
};
export const Projects = Component.bind({});
Projects.args = {
  type: types.project,
  data: defaultData,
  technologies,
  usersWorkedHere,
};

export const Workshops = Component.bind({});
Workshops.args = {
  type: types.workshop,
  data: {
    ...defaultData,
    host_user: {
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      avatar_url: `${BREATHECODE_HOST}/static/img/avatar-1.png`,
      profesion: 'Software Engineer @ACME'
    },
  },
  technologies: [{
    title: 'Javascript Beginners',
    icon_url: 'https://svgl.app/library/javascript.svg'
  }],
};

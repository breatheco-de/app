import React from 'react';
import { addDays } from 'date-fns';
import PublicCourseCard from '../common/components/PublicCourseCard';

export default {
  title: 'Components/PublicCourseCard',
  component: PublicCourseCard,
  argTypes: {
    isAvailableAsSaas: {
      control: {
        type: 'boolean'
      }
    },
    programName: {
      control: {
        type: 'text'
      }
    },
    programSlug: {
      control: {
        type: 'text'
      }
    },
    programDescription: {
      control: {
        type: 'text'
      }
    },
    startsIn: {
      control: {
        type: 'date'
      }
    },
    icon_url: {
      control: {
        type: 'text'
      }
    },
    iconBackground: {
      control: {
        type: 'text'
      }
    },
    subscriptionStatus: {
      control: {
        type: 'text'
      }
    },
    syllabusContent: {
      control: {
        type: 'object'
      }
    },
    assistants: {
      control: {
        type: 'object'
      }
    },
    courseProgress: {
      control: {
        type: 'number'
      }
    },
  }
};

const Component = (args, context) => {
  return <PublicCourseCard {...args} />
};

const teachers = [{
  isOnline: true,
  user: {
    first_name: 'Juan',
    last_name: 'López',
    profile: {
      avatar_url: '/static/images/p1.png',
    },
  },
}];

const mentors = [{
  isOnline: true,
  user: {
    first_name: 'Juan',
    last_name: 'López',
    profile: {
      avatar_url: '/static/images/p1.png',
    },
  },
},
{
  isOnline: true,
  user: {
    first_name: 'John',
    last_name: 'Doe',
    profile: {
      avatar_url: '/static/images/p2.png',
    },
  },
},
{
  isOnline: true,
  user: {
    first_name: 'Jane',
    last_name: 'Doe',
    profile: {
      avatar_url: '/static/images/p3.png',
    },
  },
},
{
  isOnline: true,
  user: {
    first_name: 'Juan',
    last_name: 'López',
    profile: {
      avatar_url: '/static/images/p1.png',
    },
  },
},
{
  isOnline: true,
  user: {
    first_name: 'John',
    last_name: 'Doe',
    profile: {
      avatar_url: '/static/images/p2.png',
    },
  },
},
{
  isOnline: true,
  user: {
    first_name: 'Jane',
    last_name: 'Doe',
    profile: {
      avatar_url: '/static/images/p3.png',
    },
  },
}];

export const Default = Component.bind({});
Default.args = {
  programName: 'A.I & Machine Learning',
  programDescription: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.',
  programSlug: "machine-learning",
  startsIn: new Date(addDays(new Date(), 3)),
  icon_url: "https://www.iconpacks.net/icons/2/free-settings-icon-3110-thumb.png",
  iconBackground: "blue.default",
  syllabusContent: {
    totalLessons: 30,
    totalProjects: 15,
    totalExercises: 15,
    completedLessons: 3,
    completedProjects: 10,
    completedExercises: 5,
  },
  subscriptionStatus: 'ACTIVE',
  assistants: mentors,
  teacher: teachers[0],
  courseProgress: 7,
};

export const withDescription = Component.bind({});
withDescription.args = {
  programName: 'Data Science',
  programDescription: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.',
  programSlug: "machine-learning",
  startsIn: new Date(addDays(new Date(), 3)),
  icon_url: "https://www.freeiconspng.com/thumbs/brain-icon-png/brain-2.png",
  iconBackground: "#25BF6C",
  subscriptionStatus: 'ACTIVE',
  courseProgress: 7,
};

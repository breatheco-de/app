import React from 'react';
import { addMinutes, addDays, subHours, addHours, subMinutes, subDays } from 'date-fns';
import ProgramCard from '../common/components/ProgramCard';

export default {
  title: 'Components/ProgramCard',
  component: ProgramCard,
  argTypes: {
    isAvailableAsSaas: {
      control: {
        type: 'boolean'
      }
    },
    subscriptionStatus: {
      control: {
        type: 'select',
        options: ['ACTIVE', 'FREE_TRIAL', 'FULLY_PAID', 'CANCELLED', 'PAYMENT_ISSUE']
      },
    },
    programName: {
      control: {
        type: 'string'
      }
    },
    programDescription: {
      control: {
        type: 'string'
      }
    },
    isBought: {
      control: {
        type: 'boolean'
      }
    },
    haveFreeTrial: {
      control: {
        type: 'boolean'
      }
    },
    startsIn: {
      control: {
        type: 'date'
      }
    },
    icon: {
      control: {
        type: 'string'
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
    isFreeTrial: {
      control: {
        type: 'boolean'
      }
    },
    freeTrialExpireDate: {
      control: {
        type: 'date'
      }
    },
    courseProgress: {
      control: {
        type: 'number'
      }
    },
    lessonNumber: {
      control: {
        type: 'number'
      }
    },
    lessonLink: {
      control: {
        type: 'string'
      }
    },
  }
};

const Component = (args, context) => {
  return <ProgramCard {...args} />
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
}]

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
  programName: 'Data Science',
  programDescription: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.',
  startsIn: new Date(addDays(new Date(), 3)),
  icon: "coding",
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
  haveFreeTrial: true,
  isFreeTrial: false,
  isBought: false,
  freeTrialExpireDate: new Date(addDays(new Date(), 5)),
  lessonLink: 'https://www.google.com',
  lessonNumber: 1.2,
  courseProgress: 7,
};

export const isLoading = Component.bind({});
isLoading.args = {
  programName: 'Data Science',
  programDescription: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.',
  startsIn: new Date(addDays(new Date(), 3)),
  icon: "coding",
  iconBackground: "blue.default",
  isLoading: true,
};
export const courseNotStarted = Component.bind({});
courseNotStarted.args = {
  programName: 'Data Science',
  programDescription: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.',
  startsIn: new Date(addDays(new Date(), 3)),
  icon: "coding",
  iconBackground: "blue.default",
  assistants: mentors,
  teacher: teachers[0],
  subscriptionStatus: 'ACTIVE',
  courseProgress: 0,
  isAvailableAsSaas: true,
  syllabusContent: {
    totalLessons: 30,
    totalProjects: 15,
    totalExercises: 15,
    completedLessons: 3,
    completedProjects: 10,
    completedExercises: 5,
  },
};

export const ongoingPaidCourse = Component.bind({});
ongoingPaidCourse.args = {
  programName: 'Data Science',
  programDescription: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.',
  startsIn: new Date(subDays(new Date(), 1)),
  icon: "coding",
  iconBackground: "blue.default",
  syllabusContent: {
    totalLessons: 30,
    totalProjects: 15,
    totalExercises: 15,
    completedLessons: 3,
    completedProjects: 10,
    completedExercises: 5,
  },
  assistants: mentors,
  teacher: teachers[0],
  // haveFreeTrial: true,
  courseProgress: 34,
  isAvailableAsSaas: false,
  subscriptionStatus: 'FULLY_PAID',
  freeTrialExpireDate: new Date(addDays(new Date(), 5)),
  lessonNumber: 1.2,
  courseProgress: 34,
};

export const ongoingFreeTrial = Component.bind({});
ongoingFreeTrial.args = {
  programName: 'Data Science',
  programDescription: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.',
  startsIn: new Date(subDays(new Date(), 1)),
  icon: "coding",
  iconBackground: "blue.default",
  syllabusContent: {
    totalLessons: 30,
    totalProjects: 15,
    totalExercises: 15,
    completedLessons: 3,
    completedProjects: 10,
    completedExercises: 5,
  },
  assistants: mentors,
  teacher: teachers[0],
  haveFreeTrial: false,
  isAvailableAsSaas: true,
  subscriptionStatus: 'FREE_TRIAL',
  freeTrialExpireDate: new Date(addDays(new Date(), 5)),
  lessonNumber: 1.2,
  courseProgress: 34,
};

export const expiredFreeTrial = Component.bind({});
expiredFreeTrial.args = {
  programName: 'Data Science',
  programDescription: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.',
  startsIn: new Date(addDays(new Date(), 3)),
  icon: "coding",
  iconBackground: "blue.default",
  syllabusContent: {
    totalLessons: 30,
    totalProjects: 15,
    totalExercises: 15,
    completedLessons: 3,
    completedProjects: 10,
    completedExercises: 5,
  },
  assistants: mentors,
  teacher: teachers[0],
  haveFreeTrial: false,
  isAvailableAsSaas: true,
  subscriptionStatus: 'FREE_TRIAL',
  freeTrialExpireDate: new Date(subDays(new Date(), 3)),
  lessonNumber: 1.2,
  courseProgress: 34,
};

export const isHiddenOnPrework = Component.bind({});
isHiddenOnPrework.args = {
  programName: 'Data Science',
  programDescription: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.',
  startsIn: new Date(addDays(new Date(), 3)),
  icon: "coding",
  subscriptionStatus: 'FREE_TRIAL',
  iconBackground: "blue.default",
  syllabusContent: {
    totalLessons: 30,
    totalProjects: 15,
    totalExercises: 15,
    completedLessons: 3,
    completedProjects: 10,
    completedExercises: 5,
  },
  assistants: mentors,
  teacher: teachers[0],
  haveFreeTrial: false,
  freeTrialExpireDate: new Date(addDays(new Date(), 0)),
  lessonNumber: 1.2,
  courseProgress: 34,
  isHiddenOnPrework: true,
};
export const courseHasStarted = Component.bind({});
courseHasStarted.args = {
  programName: 'Data Science',
  programDescription: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.',
  startsIn: new Date(subMinutes(new Date(), 128)),
  isAvailableAsSaas: true,
  subscriptionStatus: 'ACTIVE',
  icon: "coding",
  iconBackground: "blue.default",
  assistants: mentors,
  teacher: teachers[0],
  syllabusContent: {
    totalLessons: 30,
    totalProjects: 15,
    totalExercises: 15,
    completedLessons: 3,
    completedProjects: 10,
    completedExercises: 5,
  },
};
export const isNotAvailableForSaas = Component.bind({});
isNotAvailableForSaas.args = {
  programName: 'Data Science',
  programDescription: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.',
  startsIn: new Date(subDays(new Date(), 1)),
  isAvailableAsSaas: false,
  icon: "coding",
  iconBackground: "blue.default",
  assistants: mentors,
  teacher: teachers[0],
  courseProgress: 15,
  syllabusContent: {
    totalLessons: 30,
    totalProjects: 15,
    totalExercises: 15,
    completedLessons: 3,
    completedProjects: 10,
    completedExercises: 5,
  },
  // haveFreeTrial: true,
  // isFreeTrial: false,
  // isBought: true,
  // freeTrialExpireDate: new Date(addDays(new Date(), 5)),
  // lessonNumber: 1.2,
};
export const isAvailableForSaas = Component.bind({});
isAvailableForSaas.args = {
  programName: 'Data Science',
  programDescription: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.',
  startsIn: new Date(subDays(new Date(), 1)),
  isAvailableAsSaas: true,
  icon: "coding",
  iconBackground: "blue.default",
  assistants: mentors,
  teacher: teachers[0],
  courseProgress: 15,
  syllabusContent: {
    totalLessons: 30,
    totalProjects: 15,
    totalExercises: 15,
    completedLessons: 3,
    completedProjects: 10,
    completedExercises: 5,
  },
  // haveFreeTrial: true,
  subscriptionStatus: 'FREE_TRIAL',
  // isFreeTrial: true,
  // isBought: true,
  freeTrialExpireDate: new Date(addDays(new Date(), 5)),
  // lessonNumber: 1.2,
};

export const isAvailableForSaasCancelled = Component.bind({});
isAvailableForSaasCancelled.args = {
  programName: 'Data Science',
  programDescription: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.',
  startsIn: new Date(subDays(new Date(), 1)),
  isAvailableAsSaas: true,
  icon: "coding",
  iconBackground: "blue.default",
  assistants: mentors,
  teacher: teachers[0],
  courseProgress: 15,
  syllabusContent: {
    totalLessons: 30,
    totalProjects: 15,
    totalExercises: 15,
    completedLessons: 3,
    completedProjects: 10,
    completedExercises: 5,
  },
  // haveFreeTrial: true,
  subscriptionStatus: 'CANCELLED',
  // isFreeTrial: true,
  // isBought: true,
  freeTrialExpireDate: new Date(addDays(new Date(), 5)),
  // lessonNumber: 1.2,
};

export const freeTrialNoValidUntil = Component.bind({});
freeTrialNoValidUntil.args = {
  programName: 'Data Science',
  programDescription: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.',
  startsIn: new Date(subDays(new Date(), 1)),
  isAvailableAsSaas: true,
  icon: "coding",
  iconBackground: "blue.default",
  assistants: mentors,
  teacher: teachers[0],
  syllabusContent: {
    totalLessons: 30,
    totalProjects: 15,
    totalExercises: 15,
    completedLessons: 3,
    completedProjects: 10,
    completedExercises: 5,
  },
  subscriptionStatus: 'FREE_TRIAL',

  // freeTrialExpireDate: new Date(addDays(new Date(), 0)),
};

/* eslint-disable no-unused-vars */
import { Box } from '@chakra-ui/react';
import { addMinutes, addDays, subHours, addHours } from 'date-fns';
import styles from '../../styles/Home.module.css';
import ProgramCard from '../common/components/ProgramCard';
import { H1 } from '../common/styledComponents/Head';

export default function Example() {
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
  return (
    <main className={styles.main}>
      <H1 type="h1" className={styles.title} margin="40px 0">
        Example Program
      </H1>

      <Box display="flex" justifyContent="center" flexDirection="column">
        <Box marginBottom="50px">
          <ProgramCard
            programName="Data Science"
            programDescription="Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa."
            startsIn={new Date(addDays(addHours(new Date(), 2), 3))}
            icon="data-science-bg"
            syllabusContent={{
              totalLessons: 30,
              totalProjects: 15,
              totalExercises: 15,
              completedLessons: 3,
              completedProjects: 10,
              completedExercises: 5,
            }}
            mentorsAvailable={mentors}
            haveFreeTrial
          />
        </Box>
        <Box marginBottom="50px">
          <ProgramCard
            programName="Data Science"
            programDescription="Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa."
            startsIn={new Date(addDays(addHours(new Date(), 2), 3))}
            icon="data-science-bg"
            syllabusContent={{
              totalLessons: 30,
              totalProjects: 15,
              totalExercises: 15,
              completedLessons: 3,
              completedProjects: 10,
              completedExercises: 5,
            }}
            mentorsAvailable={mentors}
            isFreeTrial
            isBought
            // freeTrialExpireDate={new Date(addDays(new Date(), 5))}
            freeTrialExpireDate={new Date(subHours(new Date(), 5))}
            // freeTrialExpireDate={new Date(addHours(new Date(), 2))}
            courseProgress={7}
            lessonLink="https://www.google.com"
          />
        </Box>
        <Box marginBottom="50px">
          <ProgramCard
            programName="Data Science"
            programDescription="Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa."
            startsIn={new Date(addDays(addHours(new Date(), 2), 3))}
            icon="data-science-bg"
            syllabusContent={{
              totalLessons: 30,
              totalProjects: 15,
              totalExercises: 15,
              completedLessons: 3,
              completedProjects: 10,
              completedExercises: 5,
            }}
            lessonLink="https://www.google.com"
            lessonNumber={1.2}
            mentorsAvailable={mentors}
            isBought
            courseProgress={7}
          />
        </Box>
      </Box>

    </main>
  );
}

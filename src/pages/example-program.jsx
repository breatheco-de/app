import { Box } from '@chakra-ui/react';
import styles from '../../styles/Home.module.css';
import ProgramCard from '../common/components/ProgramCard';
import { H1 } from '../common/styledComponents/Head';

export default function Example() {
  return (
    <main className={styles.main}>
      <H1 type="h1" className={styles.title} margin="40px 0">
        Example Program
      </H1>

      <Box display="flex" justifyContent="center">
        <ProgramCard
          programName="Data Science"
          programDescription="Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa."
          haveFreeTrial
        />
      </Box>

    </main>
  );
}

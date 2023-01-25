import { Box, Button } from '@chakra-ui/react';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { usePersistent } from '../../hooks/usePersistent';
import Heading from '../Heading';
import Icon from '../Icon';
import Progress from '../ProgressBar/Progress';
import Text from '../Text';
import FinalProjectModal from './Modal';

const FinalProject = ({ studentAndTeachers }) => {
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const [cohortSession] = usePersistent('cohortSession', {});
  const students = studentAndTeachers.filter((student) => student.role === 'STUDENT').map((student) => ({
    ...student,
    user: {
      ...student?.user,
      full_name: `${student?.user?.first_name} ${student?.user?.last_name}`,
    },
  }));

  return (
    <Box minHeight="300px" background="blue.900" borderRadius="lg" position="relative" color="white" textAlign="center" padding="0 34px 24px 34px">
      <Box className="center-absolute-x" top="0" background="yellow.default" padding="9px" borderBottomRadius="4px">
        <Icon icon="graduationCap" width="46px" height="39px" />
      </Box>
      <Box marginTop="4rem">
        <Heading
          size="18px"
        >
          What do you need to graduate?
        </Heading>
        <Text size="l" mt="10px">
          Almost there! You are on the last sprint before graduation, please make sure to complete the following activities:
        </Text>
        <Box display="flex" flexDirection="column" gridGap="20px" padding="0 24px" mt="2rem">
          <Button
            display="flex"
            height="45px"
            gridGap="10px"
            m="0 auto"
            width="100%"
            onClick={openModal}
            variant="unstyled"
            background="blue.light"
            color="blue.default"
            padding="0 27px"
          >
            <Icon icon="add" width="25px" height="25px" />
            Add final project info
          </Button>
          <Box display="flex" flexDirection="column" gridGap="10px" borderColor="white" border="1px solid" padding="10px 22px" borderRadius="4px">
            <Text size="l">
              Complete required projects
            </Text>
            <Progress
              percents={99}
              duration={0.4}
              barHeight="5px"
              borderRadius="20px"
            />
          </Box>
        </Box>
      </Box>
      <FinalProjectModal
        isOpen={isOpen}
        closeModal={closeModal}
        studentsData={students}
        cohortData={cohortSession}
      />
    </Box>
  );
};

FinalProject.propTypes = {
  studentAndTeachers: PropTypes.arrayOf(PropTypes.any),
};

FinalProject.defaultProps = {
  studentAndTeachers: [],
};

export default FinalProject;

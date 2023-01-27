import { Box, Button, Modal, ModalCloseButton, ModalContent, ModalOverlay } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { usePersistent } from '../../hooks/usePersistent';
import Heading from '../Heading';
import Icon from '../Icon';
import Progress from '../ProgressBar/Progress';
import Text from '../Text';
import FinalProjectModal from './Modal';
import bc from '../../services/breathecode';
import FinalProjectForm from './Form';
import useStyle from '../../hooks/useStyle';

const FinalProject = ({ studentAndTeachers }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [finalProject, setFinalProjects] = useState([]);
  const [cohortSession] = usePersistent('cohortSession', {});
  const router = useRouter();
  const { modal } = useStyle();
  const { cohortSlug } = router.query;
  const repoUrl = finalProject?.currentProject?.repo_url;

  const openModal = () => {
    if (repoUrl) {
      setOpenForm(true);
    } else {
      setIsOpen(true);
    }
  };
  const closeModal = () => setIsOpen(false);

  const students = studentAndTeachers.map((student) => ({
    ...student,
    user: {
      ...student?.user,
      full_name: `${student?.user?.first_name} ${student?.user?.last_name}`,
    },
  }));

  useEffect(() => {
    bc.todo({
      visibility_status: 'PRIVATE',
    }).getFinalProject()
      .then((res) => {
        const currentProject = res?.data?.find((project) => project?.cohort?.slug === cohortSlug);
        if (currentProject !== undefined) {
          setFinalProjects({
            currentProject,
            allProjects: res?.data,
          });
        }
      });
  }, []);

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
            <Icon icon={repoUrl ? 'underlinedPencil' : 'add'} width="25px" height="25px" />
            {repoUrl ? 'Edit final project info' : 'Add final project info'}
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
      {openForm && (
        <Modal size="lg" isOpen={openForm} onClose={setOpenForm}>
          <ModalOverlay />
          <ModalContent margin="5rem 0 4rem 0" background={modal.background} borderRadius="13px">
            <ModalCloseButton />
            <FinalProjectForm
              defaultValues={finalProject?.currentProject}
              allProjects={finalProject?.allProjects}
              cohortData={cohortSession}
              studentsData={students}
              handleClose={() => setOpenForm(false)}
            />
          </ModalContent>
        </Modal>
      )}
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

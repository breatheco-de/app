/* eslint-disable no-unused-vars */
import { useState, useEffect, forwardRef } from 'react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import {
  Box,
  Avatar,
  Button,
  IconButton,
  Flex,
  Divider,
  Img,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import bc from '../services/breathecode';
import NextChakraLink from '../components/NextChakraLink';
import useStyle from '../hooks/useStyle';
import ReactSelect from '../components/ReactSelect';
import LoaderScreen from '../components/LoaderScreen';
import Heading from '../components/Heading';
import Text from '../components/Text';
import Icon from '../components/Icon';

function ProjectCard({ project, updpateProject }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { name, description, members, revision_status: revisionStatus } = project;
  const { t } = useTranslation('assignments');
  const { hexColor, fontColor } = useStyle();
  const router = useRouter();
  const { query } = router;
  const { cohortSlug, academy } = query;

  const revissionStatusList = [
    {
      label: t('status.pending'),
      value: 'PENDING',
    },
    {
      label: t('status.approved'),
      value: 'APPROVED',
    },
    {
      label: t('status.rejected'),
      value: 'REJECTED',
    },
    {
      label: t('status.ignored'),
      value: 'IGNORED',
    },
  ];

  const charLimit = 270;
  const isDescriptionTrimmed = description.length > charLimit;
  const trimmedDescription = isDescriptionTrimmed ? `${description.substring(0, charLimit)}...` : description;

  const statusColors = {
    DONE: hexColor.blueDefault,
    PENDING: hexColor.yellowDefault,
  };

  const revissionColors = {
    IGNORED: hexColor.disabledColor,
    PENDING: hexColor.disabledColor,
    APPROVED: hexColor.green,
    REJECTED: hexColor.danger,
  };

  const statusText = t('project-status', {}, { returnObjects: true });
  const projectRevissionStatus = revissionStatusList.find(({ value }) => value === revisionStatus);

  const dot = () => ({
    alignItems: 'center',
    display: 'flex',

    ':before': {
      backgroundColor: revissionColors[revisionStatus],
      borderRadius: 10,
      content: '" "',
      display: 'block',
      marginRight: 8,
      height: 10,
      width: 10,
    },
  });

  const colourStyles = {
    input: (styles) => ({ ...styles, ...dot(), color: fontColor }),
    placeholder: (styles) => ({ ...styles, ...dot(), color: fontColor }),
    singleValue: (styles) => ({ ...styles, ...dot(), color: fontColor }),
  };

  return (
    <Box
      border={`1px solid ${hexColor.borderColor}`}
      padding="8px 22px"
      borderRadius="11px"
      overflow="visible"
    >
      <Flex overflow="visible" gap="10px">
        <Box width="100%">
          <Box>
            <Box display="flex" justifyContent="space-between">
              <Box display="flex" gap="15px" alignItems="center">
                <Text fontWeight="900">
                  {name}
                </Text>
                <Text
                  color={statusColors[project.project_status]}
                  border={`1px solid ${statusColors[project.project_status]}`}
                  padding="4px 10px"
                  borderRadius="18px"
                  maxHeight="22px"
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                >
                  {statusText[project.project_status.toLowerCase()]}
                </Text>
              </Box>
              {isDescriptionTrimmed && (
                <IconButton
                  variant="ghost"
                  aria-label={isExpanded ? t('common:show-less') : t('common:show-more')}
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  icon={(
                    <ChevronDownIcon
                      w="8"
                      h="8"
                      style={{ rotate: isExpanded ? '180deg' : '0deg', transition: 'rotate 0.5s' }}
                    />
                  )}
                />
              )}
            </Box>
            <Box display="flex" gap="20px" mt="10px" flexDirection={{ base: 'column', sm: 'row' }}>
              {project.screenshot && (
                <Img
                  width={{ base: '100%', sm: '178px' }}
                  height="110px"
                  borderRadius="11px"
                  src={project.screenshot}
                />
              )}
              <Text size="md" lineHeight="16px">
                {!isDescriptionTrimmed || isExpanded ? description : trimmedDescription}
              </Text>
            </Box>
          </Box>
          <Divider background={hexColor.borderColor} margin="10px 0" />
          <Flex flexDirection={{ base: 'column', sm: 'row' }} overflow="visible" justifyContent="space-between" flexWrap="wrap">
            <Flex gap="10px" flexWrap="wrap">
              {members.map((member) => (
                <NextChakraLink key={member.id} href={`/cohort/${cohortSlug}/student/${member.id}?academy=${academy}`} target="_blank">
                  <Box display="flex" gap="5px" alignItems="center" padding="4px" borderRadius="18px" background="gray.light3">
                    <Avatar
                      src={member.profile?.avatar_url}
                      width="25px"
                      height="25px"
                      style={{ userSelect: 'none' }}
                    />
                    <Text color="gray.dark">
                      {`${member.first_name} ${member.last_name}`}
                    </Text>
                  </Box>
                </NextChakraLink>
              ))}
            </Flex>
            <ReactSelect
              key="revision-select"
              id="revision-select"
              value={projectRevissionStatus || ''}
              options={revissionStatusList}
              styles={colourStyles}
              isSearchable={false}
              onChange={(opt) => {
                updpateProject(project, opt.value);
              }}
            />
          </Flex>
        </Box>
        {(project.repo_url || project.video_demo_url) && (
          <Box minWidth="58px" display="flex" gap="10px">
            {project.repo_url && (
              <NextChakraLink href={project.repo_url} target="_blank">
                <Icon icon="github" color={hexColor.blueDefault} width="24px" height="24px" />
              </NextChakraLink>
            )}
            {project.video_demo_url && (
              <NextChakraLink href={project.video_demo_url} target="_blank">
                <Icon icon="tv-live" color={hexColor.blueDefault} width="24px" height="24px" />
              </NextChakraLink>
            )}
          </Box>
        )}
      </Flex>
    </Box>
  );
}

const ProjectsSection = forwardRef(({ finalProjects, updpateProject }, ref) => (
  <>
    {finalProjects.map((project) => {
      const { id } = project;
      return (
        <Box
          key={id}
          ref={ref || null}
          overflow="visible"
        >
          <ProjectCard project={project} updpateProject={updpateProject} />
        </Box>
      );
    })}
  </>
));

function FinalProjects({ finalProjects, loadStatus, updpateProject }) {
  const { t } = useTranslation('assignments');
  const router = useRouter();
  const { query } = router;
  const { cohortSlug } = query;
  const { fontColor3 } = useStyle();
  const [pendingStudents, setPendingStudents] = useState([]);
  const [openStudentsModal, setOpenStudentsModal] = useState(false);

  const getAllStudents = async () => {
    try {
      if (finalProjects.length > 0) {
        const resp = await bc.cohort().getStudents2(cohortSlug);
        if (resp.status === 200) {
          const { data } = resp;
          const members = finalProjects.flatMap((project) => project.members);
          const pending = data.filter((student) => student.role === 'STUDENT' && !members.some((member) => member.id === student.user.id));
          setPendingStudents(pending);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getAllStudents();
  }, [finalProjects]);

  return (
    <Box
      minHeight="34vh"
      borderRadius="3px"
      margin="0 auto"
      maxWidth="1012px"
      flexGrow={1}
      overflow="visible"
    >
      {loadStatus.status !== 'loading' && finalProjects.length === 0 && (
        <Heading textAlign="center">
          {t('no-final-projects')}
        </Heading>
      )}
      {pendingStudents.length > 0 && (
        <Box display="flex" alignItems="center" gap="10px" margin="10px 0" background="yellow.light" padding="8px" borderRadius="4px">
          <Icon icon="warning" width="14px" height="14px" />
          <Text color="black">
            {t('no-upload-students')}
            {'  '}
            <Button color="black" variant="link" height="18px" fontWeight="400" onClick={() => setOpenStudentsModal(true)}>
              {t('see-students')}
            </Button>
          </Text>
        </Box>
      )}
      <Modal isOpen={openStudentsModal} onClose={setOpenStudentsModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="15px" textTransform="uppercase">
            {t('pending-upload-modal.title')}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text size="l" color={fontColor3}>
              {t('pending-upload-modal.description')}
            </Text>
            <Box mt="10px" display="flex" flexDirection="column" gap="12px">
              {pendingStudents.map((student) => (
                <Box
                  key={student.id}
                  padding="8px 22px"
                  borderRadius="11px"
                  background="gray.light3"
                  display="flex"
                  alignItems="center"
                  gap="10px"
                >
                  <Avatar
                    src={student.user.profile?.avatar_url}
                    width="32px"
                    height="32px"
                    style={{ userSelect: 'none' }}
                  />
                  <Text>
                    {`${student.user.first_name} ${student.user.last_name}`}
                  </Text>
                </Box>
              ))}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
      <Flex overflow="visible" flexDirection="column" gridGap="18px">
        <ProjectsSection
          finalProjects={finalProjects}
          updpateProject={updpateProject}
        />
      </Flex>
      {loadStatus.status === 'loading' && (
        <Box
          display="flex"
          justifyContent="center"
          mt="2rem"
          mb="5rem"
          position="relative"
        >
          <LoaderScreen width="80px" height="80px" />
        </Box>
      )}
    </Box>
  );
}

FinalProjects.propTypes = {
  updpateProject: PropTypes.func.isRequired,
  loadStatus: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  finalProjects: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
};

ProjectsSection.propTypes = {
  finalProjects: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  updpateProject: PropTypes.func.isRequired,
};

ProjectCard.propTypes = {
  project: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  updpateProject: PropTypes.func.isRequired,
};

export default FinalProjects;

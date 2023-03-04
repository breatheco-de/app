/* eslint-disable no-unused-vars */
import PropTypes from 'prop-types';
import { Box, useColorModeValue, Button } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import Text from './Text';
import Heading from './Heading';
import ProjectsSection from './ProjectsSection';

const PublicCourseCard = ({
  programName, programDescription, icon, iconBackground, startsIn,
  stTranslation, syllabusContent, courseProgress, usersConnected, assistants,
  teacher, isAvailableAsSaas, subscriptionStatus,
}) => {
  const { t, lang } = useTranslation('program-card');
  const textColor = useColorModeValue('black', 'white');

  const programCardTR = stTranslation?.[lang]?.['program-card'];

  return (
    <Box
      border="1px solid"
      borderColor="#DADADA"
      borderRadius="9px"
      width="300px"
      padding="15px"
      height="min-content"
    >
      <Heading
        size="lg"
        as="h3"
        lineHeight="31px"
        fontWeight="700"
        color={textColor}
        marginBottom="10px"
        textAlign="center"
      >
        {programName}
      </Heading>
      <ProjectsSection
        startsIn={startsIn}
        stTranslation={stTranslation}
        syllabusContent={syllabusContent}
        courseProgress={courseProgress}
        usersConnected={usersConnected}
        assistants={assistants}
        teacher={teacher}
        isAvailableAsSaas={isAvailableAsSaas}
        subscriptionStatus={subscriptionStatus}
      />
      <Button
        margin="10px auto 0 auto"
        display="block"
        borderRadius="3px"
        width="50%"
        padding="0"
        whiteSpace="normal"
        variant="default"
      >
        {stTranslation?.[lang]?.common.enroll || t('common:enroll')}
      </Button>
    </Box>
  );
};

PublicCourseCard.propTypes = {
  programName: PropTypes.string.isRequired,
  programDescription: PropTypes.string,
  icon: PropTypes.string,
  iconBackground: PropTypes.string,
  startsIn: PropTypes.instanceOf(Date),
  syllabusContent: PropTypes.objectOf(PropTypes.any),
  courseProgress: PropTypes.number,
  stTranslation: PropTypes.objectOf(PropTypes.any),
  usersConnected: PropTypes.arrayOf(PropTypes.number),
  assistants: PropTypes.arrayOf(PropTypes.any),
  teacher: PropTypes.objectOf(PropTypes.any),
  isAvailableAsSaas: PropTypes.bool,
  subscriptionStatus: PropTypes.string,
};

PublicCourseCard.defaultProps = {
  programDescription: null,
  iconBackground: '',
  icon: null,
  stTranslation: null,
  startsIn: null,
  syllabusContent: null,
  courseProgress: null,
  usersConnected: [],
  assistants: [],
  teacher: null,
  isAvailableAsSaas: true,
  subscriptionStatus: '',
};

export default PublicCourseCard;

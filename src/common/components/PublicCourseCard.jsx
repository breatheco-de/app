/* eslint-disable camelcase */
import PropTypes from 'prop-types';
import { Box, useColorModeValue, Button, Divider, Img } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import Text from './Text';
import Heading from './Heading';
import ProjectsSection from './ProjectsSection';

const PublicCourseCard = ({
  programName, programDescription, icon_url, iconBackground, startsIn,
  stTranslation, syllabusContent, courseProgress, usersConnected, assistants,
  teacher, isAvailableAsSaas, subscriptionStatus,
}) => {
  const { t, lang } = useTranslation('program-card');
  const textColor = useColorModeValue('black', 'white');

  return (
    <Box width="300px">
      <Box
        borderRadius="9px 9px 0 0"
        width="90%"
        margin="auto"
        height="140px"
        background={iconBackground}
        display="flex"
        flexDirection="column"
        justifyContent="center"
      >
        {/* <Icon color="#FFF" icon={icon} width="84px" height="74px" style={{ margin: 'auto' }} /> */}
        <Img
          width="84px"
          height="74px"
          // boxSize="100%"
          margin="auto"
          objectFit="cover"
          src={icon_url}
          alt="Course Icon"
        />
      </Box>
      <Box
        border="1px solid"
        borderColor="#DADADA"
        borderRadius="9px"
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
        <Divider w="90%" margin="auto" />
        {syllabusContent || assistants.length > 0 ? (
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
        ) : (
          <Text
            fontSize="xs"
            lineHeight="14px"
            fontWeight="700"
            color={textColor}
            textAlign="center"
            marginTop="20px"
          >
            {programDescription}
          </Text>
        )}
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
    </Box>
  );
};

PublicCourseCard.propTypes = {
  programName: PropTypes.string.isRequired,
  programDescription: PropTypes.string,
  icon_url: PropTypes.string,
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
  icon_url: '',
  iconBackground: '',
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

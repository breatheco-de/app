/* eslint-disable camelcase */
import PropTypes from 'prop-types';
import { Box, useColorModeValue, Img } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import Link from './NextChakraLink';
import Text from './Text';
import Heading from './Heading';
import ProjectsSection from './ProjectsSection';
import useStyle from '../hooks/useStyle';
import { ORIGIN_HOST } from '../../utils/variables';

function PublicCourseCard({
  programName, programDescription, programSlug, icon_url, iconBackground, startsIn,
  syllabusContent, courseProgress, usersConnected, assistants,
  teacher, isAvailableAsSaas, subscriptionStatus, width, href, onClick, ...rest
}) {
  const { t } = useTranslation('program-card');
  const { backgroundColor2, hexColor } = useStyle();
  const textColor = useColorModeValue('black', 'white');

  return (
    <Box
      border="1px solid"
      borderColor={hexColor.borderColor}
      borderRadius="9px"
      padding="15px"
      background={backgroundColor2}
      position="relative"
      width={width}
      marginTop="30px"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      {...rest}
    >
      <Box position="absolute" borderRadius="full" top="-30px">
        <Img src={icon_url} width="44px" height="44px" />
      </Box>
      <Box height="10px" />
      <Box>
        <Heading
          size="lg"
          as="h3"
          lineHeight="19px"
          fontWeight="700"
          color={textColor}
          margin="0 0 5px 0 !important"
        >
          {programName}
        </Heading>
        {syllabusContent || assistants.length > 0 ? (
          <ProjectsSection
            startsIn={startsIn}
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
            size={{ base: 'md', md: 'xs' }}
            lineHeight={{ base: '24px', md: '14px' }}
            fontWeight="500"
            color={textColor}
            marginTop="0 !important"
            overflow="hidden !important"
          >
            {programDescription}
          </Text>
        )}
      </Box>
      <Link
        variant="buttonDefault"
        border="1px solid"
        borderRadius="3px"
        onClick={onClick}
        href={href || `${ORIGIN_HOST}/${programSlug}`}
        textAlign="center"
        marginTop="10px"
        display="block"
        width="120px"
        color="white !important"
        textDecoration="none !important"
        padding="7px 16px !important"
        _hover={{ opacity: 0.7 }}
        _active={{ opacity: 1 }}
      >
        {t('common:learn-more')}
      </Link>
    </Box>
  );
}

PublicCourseCard.propTypes = {
  programName: PropTypes.string.isRequired,
  programDescription: PropTypes.string,
  programSlug: PropTypes.string.isRequired,
  icon_url: PropTypes.string,
  iconBackground: PropTypes.string,
  startsIn: PropTypes.instanceOf(Date),
  syllabusContent: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  courseProgress: PropTypes.number,
  usersConnected: PropTypes.arrayOf(PropTypes.number),
  assistants: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  teacher: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  isAvailableAsSaas: PropTypes.bool,
  subscriptionStatus: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.objectOf(PropTypes.any)]),
  href: PropTypes.string,
  onClick: PropTypes.func,
};

PublicCourseCard.defaultProps = {
  programDescription: null,
  icon_url: '',
  iconBackground: '',
  startsIn: null,
  syllabusContent: null,
  courseProgress: null,
  usersConnected: [],
  assistants: [],
  teacher: null,
  isAvailableAsSaas: true,
  subscriptionStatus: '',
  width: '300px',
  href: '',
  onClick: () => {},
};

export default PublicCourseCard;

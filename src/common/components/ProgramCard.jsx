/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable no-unused-vars */
import PropTypes from 'prop-types';
import {
  Box,
  useColorModeValue,
  Button,
  Flex,
  AvatarGroup,
  Progress,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { formatDuration, intervalToDuration } from 'date-fns';
import { es, en } from 'date-fns/locale';
import CustomTheme from '../../../styles/theme';
import AvatarUser from '../../js_modules/cohortSidebar/avatarUser';
import Text from './Text';
import Heading from './Heading';
import Icon from './Icon';

const availableLanguages = {
  es,
  en,
};

const ProgramCard = ({
  programName,
  programDescription,
  isBought,
  haveFreeTrial,
  startsIn,
  icon,
  stTranslation,
  syllabusContent,
  mentorsAvailable,
  isFreeTrial,
  freeTrialExpireDate,
  courseProgress,
}) => {
  const { t, lang } = useTranslation('program-card');
  const textColor = useColorModeValue('black', 'white');
  const bgColor = useColorModeValue('featuredLight', 'featuredDark');

  const formatTimeString = (start) => {
    const duration = intervalToDuration({
      end: new Date(),
      start,
    });

    const formated = formatDuration(duration,
      {
        format: ['months', 'weeks', 'days', 'hours', 'minutes'],
        delimiter: ', ',
        locale: availableLanguages[lang],
      });

    if (formated === '') return stTranslation ? stTranslation[lang]['program-card']['few-seconds'] : t('few-seconds');
    return formated;
  };

  const syllabusArray = () => {
    const contentArray = [];
    if (syllabusContent?.lessons) contentArray.push(`${syllabusContent.lessons} ${t('lessons')}`);
    if (syllabusContent?.projects) contentArray.push(`${syllabusContent.projects} ${t('projects')}`);
    if (syllabusContent?.exercises) contentArray.push(`${syllabusContent.exercises} ${t('exercises')}`);
    return contentArray;
  };

  const ProjectsSection = () => (syllabusArray().length > 0 || mentorsAvailable.length > 0) && (
    <Flex justifyContent="space-between" marginTop="10px" padding="10px" borderRadius="5px" background={bgColor}>
      {syllabusArray().length > 0 && (
        <Box>
          {syllabusArray().map((elem) => (
            <Text
              fontSize="xs"
              lineHeight="14px"
              fontWeight="700"
              color={textColor}
              key={elem}
              display="flex"
              marginBottom="5px"
            >
              <Icon
                width="14px"
                height="14px"
                style={{ marginRight: '5px' }}
                icon="book"
              />
              {elem}
            </Text>
          ))}
        </Box>
      )}
      {mentorsAvailable.length > 0 && (
        <Box>
          <Text
            fontSize="xs"
            lineHeight="14px"
            fontWeight="700"
            color={textColor}
            marginBottom="5px"
            textAlign="center"
          >
            {`${mentorsAvailable.length} ${t('mentors-available')}`}
          </Text>
          <AvatarGroup max="3">
            {mentorsAvailable?.map((c, i) => {
              const fullName = `${c.user.first_name} ${c.user.last_name}`;
              const { isOnline } = c;
              return (
                <AvatarUser
                  width="35px"
                  height="35px"
                  index={i}
                  key={`${c.id} - ${c.user.first_name}`}
                  isWrapped
                  fullName={fullName}
                  data={c}
                  isOnline={isOnline}
                  badge
                />
              );
            })}
          </AvatarGroup>
        </Box>
      )}
    </Flex>
  );

  const FreeTagCapsule = () => {
    let timeString = '';
    let expired = false;
    const now = new Date();
    const duration = intervalToDuration({
      end: now,
      start: freeTrialExpireDate,
    });

    const formated = formatDuration(duration,
      {
        format: ['days'],
        locale: availableLanguages[lang],
      });

    if (duration.days > 0) timeString = `${formated} ${stTranslation ? stTranslation[lang]['program-card'].left : t('left')}`;
    else if (formated === '' && freeTrialExpireDate > now) timeString = stTranslation ? stTranslation[lang]['program-card'].today : t('today');
    else {
      timeString = stTranslation ? stTranslation[lang]['program-card']['non-left'] : t('non-left');
      expired = true;
    }

    return (
      <Flex
        borderRadius="15px"
        background={expired ? '#FFE7E9' : CustomTheme.colors.yellow.light}
        padding="5px"
        height="21px"
      >
        <Icon icon="free" width="29px" height="14px" style={{ marginRight: '10px' }} />
        <Text
          fontSize="xs"
          lineHeight="14px"
          fontWeight="400"
          color={expired ? '#EB5757' : '#01455E'}
        >
          {timeString}
        </Text>
      </Flex>
    );
  };

  return (
    <Box
      border="1px solid"
      borderColor="#DADADA"
      borderRadius="9px"
      width="292px"
      padding="15px"
      position="relative"
    >
      <Box position="absolute" borderRadius="full" top="-30px">
        <Icon
          width="54px"
          height="54px"
          icon={icon}
        />
      </Box>
      <Flex height="30px" id="upper-left-section" flexDirection="row-reverse">
        {!isBought ? (
          <Flex width="116px">
            <Box marginRight="10px">
              <Icon
                width="14px"
                height="21px"
                icon="rocket"
              />
            </Box>
            <Box>
              <Text
                fontSize="9px"
                lineHeight="9.8px"
                fontWeight="600"
                color={textColor}
              >
                {t('starts-in')}
              </Text>
              <Text
                fontSize="9px"
                lineHeight="9.8px"
                fontWeight="400"
                color={textColor}
              >
                {formatTimeString(startsIn)}
              </Text>
            </Box>
          </Flex>
        ) : (
          <>
            {isFreeTrial ? (
              <FreeTagCapsule />
            ) : (
              <Icon icon="crown" width="22px" height="15px" />
            )}
          </>
        )}
      </Flex>
      <Text
        fontSize="md"
        lineHeight="19px"
        fontWeight="700"
        color={textColor}
        marginBottom="10px"
      >
        {programName}
        {' '}
      </Text>

      {!isBought ? (
        <Box>
          <Text
            fontSize="xs"
            lineHeight="14px"
            fontWeight="500"
            color={textColor}
          >
            {programDescription}
            {' '}
          </Text>
          <ProjectsSection />
          <Button
            marginTop="20px"
            borderRadius="3px"
            width="100%"
            padding="0"
            whiteSpace="normal"
            variant="default"
          >
            Start Course
          </Button>
          {haveFreeTrial && (
            <Button
              marginTop="15px"
              borderRadius="3px"
              width="100%"
              padding="0"
              whiteSpace="normal"
              variant="outline"
              borderColor="blue.default"
              color="blue.default"
            >
              Free Trial
            </Button>
          )}
        </Box>
      ) : (
        <Box marginTop="20px">
          <Box margin="auto" width="90%">
            <Progress value={courseProgress} borderRadius="20px" />
            <Text
              fontSize="8px"
              lineHeight="9.8px"
              fontWeight="500"
              marginTop="5px"
              color={CustomTheme.colors.blue.default2}
            >
              {`${courseProgress}%`}
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
};

ProgramCard.propTypes = {
  programName: PropTypes.string.isRequired,
  programDescription: PropTypes.string,
  startsIn: PropTypes.instanceOf(Date),
  freeTrialExpireDate: PropTypes.instanceOf(Date),
  isBought: PropTypes.bool,
  haveFreeTrial: PropTypes.bool,
  isFreeTrial: PropTypes.bool,
  icon: PropTypes.string.isRequired,
  syllabusContent: PropTypes.objectOf(PropTypes.any),
  mentorsAvailable: PropTypes.arrayOf(PropTypes.any),
  courseProgress: PropTypes.number,
  stTranslation: PropTypes.objectOf(PropTypes.any),
};

ProgramCard.defaultProps = {
  stTranslation: null,
  programDescription: null,
  startsIn: null,
  haveFreeTrial: false,
  isBought: false,
  isFreeTrial: false,
  mentorsAvailable: [],
  syllabusContent: null,
  courseProgress: null,
  freeTrialExpireDate: null,
};

export default ProgramCard;

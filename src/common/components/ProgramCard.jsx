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
import Link from './NextChakraLink';
import Text from './Text';
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
  lessonNumber,
  lessonLink,
  isLoading,
}) => {
  const { t, lang } = useTranslation('program-card');
  const textColor = useColorModeValue('black', 'white');
  const bgColor = useColorModeValue('featuredLight', 'featuredDark');
  const now = new Date();
  const isExpired = isFreeTrial && freeTrialExpireDate < now;

  const formatTimeString = (start) => {
    const duration = intervalToDuration({
      end: now,
      start,
    });

    if (duration.days > 0) duration.hours = 0;

    const formated = formatDuration(duration,
      {
        format: ['months', 'weeks', 'days', 'hours'],
        delimiter: ', ',
        locale: availableLanguages[lang],
      });

    if (formated === '') return stTranslation ? stTranslation[lang]['program-card']['starting-today'] : t('starting-today');
    if (start < now) return stTranslation ? stTranslation[lang]['program-card'].started : t('started');
    return formated;
  };

  const syllabusArray = () => {
    const contentArray = [];
    if (syllabusContent?.totalLessons) {
      contentArray.push({
        name: 'lessons',
        total: syllabusContent.totalLessons,
        completed: syllabusContent.completedLessons,
      });
    }
    if (syllabusContent?.totalProjects) {
      contentArray.push({
        name: 'projects',
        total: syllabusContent.totalProjects,
        completed: syllabusContent.completedProjects,
      });
    }
    if (syllabusContent?.totalExercises) {
      contentArray.push({
        name: 'exercises',
        total: syllabusContent.totalExercises,
        completed: syllabusContent.completedExercises,
      });
    }
    return contentArray;
  };

  const ProjectsSection = () => (syllabusArray()?.length > 0 || mentorsAvailable?.length > 0) && (
    <Flex justifyContent="space-between" alignItems="center" marginTop="10px" padding="10px" borderRadius="5px" background={bgColor}>
      {syllabusArray()?.length > 0 && (
        <Box display="flex" flexDirection="column" gridGap="3px">
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
              {isBought && (
              <>
                <span style={{ color: CustomTheme.colors.blue.default2 }}>{elem.completed || 0}</span>
                /
              </>
              )}
              {`${elem.total} ${t(elem.name)}`}
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
    const duration = intervalToDuration({
      end: now,
      start: freeTrialExpireDate,
    });

    const formated = formatDuration(duration,
      {
        format: ['days'],
        locale: availableLanguages[lang],
      });

    if (isExpired) timeString = stTranslation ? stTranslation[lang]['program-card']['non-left'] : t('non-left');
    else if (duration.days > 0) timeString = `${formated} ${stTranslation ? stTranslation[lang]['program-card'].left : t('left')}`;
    else timeString = stTranslation ? stTranslation[lang]['program-card'].today : t('today');

    return (
      <Flex
        borderRadius="15px"
        background={isExpired ? '#FFE7E9' : CustomTheme.colors.yellow.light}
        padding="5px"
        height="21px"
        alignItems="center"
      >
        <Icon icon="free" width="29px" height="14px" style={{ marginRight: '5px' }} />
        <Text
          fontSize="xs"
          lineHeight="14px"
          fontWeight="400"
          color={isExpired ? '#EB5757' : '#01455E'}
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
        {isLoading ? (
          <></>
        ) : (
          <>
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
                    {stTranslation ? stTranslation[lang]['program-card']['starts-in'] : t('starts-in')}
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

      {isLoading ? (
        <>
          <Text
            fontSize="xs"
            lineHeight="14px"
            fontWeight="500"
            color={textColor}
          >
            {programDescription}
            {' '}
          </Text>
          <Button variant="outline" marginTop="20px" color="blue.default" borderColor="currentcolor" w="full" fontSize="12px" letterSpacing="0.05em">
            Loading...
          </Button>
        </>
      ) : (
        <>
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
                <Progress value={courseProgress} colorScheme="blueDefaultScheme" height="10px" borderRadius="20px" />
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
              {!isExpired && (
                <>
                  <ProjectsSection />
                  <Text
                    marginTop="20px"
                    color={CustomTheme.colors.blue.default}
                    textAlign="center"
                    fontSize="xs"
                    lineHeight="14px"
                    fontWeight="700"
                  >
                    <Link
                      rel="noopener noreferrer"
                      href={lessonLink || '#'}
                      display="inline-block"
                      letterSpacing="0.05em"
                      fontFamily="Lato, Sans-serif"
                    >
                      {`${t('continue')} ${lessonNumber}  →`}
                    </Link>
                  </Text>
                </>

              )}
              {isFreeTrial && (
                <Button
                  marginTop="25px"
                  borderRadius="3px"
                  width="100%"
                  padding="0"
                  whiteSpace="normal"
                  variant="default"
                  alignItems="center"
                  background="yellow.default"
                  color="white"
                >
                  <Icon style={{ marginRight: '10px' }} width="12px" height="18px" icon="rocket" color="currentColor" />
                  Upgrade
                </Button>
              )}
            </Box>
          )}
        </>
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
  lessonNumber: PropTypes.number,
  lessonLink: PropTypes.string,
  isLoading: PropTypes.bool,
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
  lessonNumber: null,
  lessonLink: null,
  isLoading: false,
};

export default ProgramCard;

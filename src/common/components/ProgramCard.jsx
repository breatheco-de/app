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
import { Fragment } from 'react';
import CustomTheme from '../../../styles/theme';
import AvatarUser from '../../js_modules/cohortSidebar/avatarUser';
import Text from './Text';
import Icon from './Icon';
import { isNumber, isValidDate } from '../../utils';
import useStyle from '../hooks/useStyle';

const availableLanguages = {
  es,
  en,
};

const ProgramCard = ({
  programName, programDescription, isBought, haveFreeTrial, startsIn, icon, iconBackground, stTranslation,
  syllabusContent, isFreeTrial, freeTrialExpireDate, courseProgress, lessonNumber, isLoading,
  width, usersConnected, assistants, teacher, handleChoose, isHiddenOnPrework,
}) => {
  const { t, lang } = useTranslation('program-card');
  const textColor = useColorModeValue('black', 'white');
  const bgColor = useColorModeValue('featuredLight', 'featuredDark');
  const now = new Date();
  const { lightColor } = useStyle();
  const isExpired = isFreeTrial && freeTrialExpireDate < now;

  const programCardTR = stTranslation?.[lang]?.['program-card'];

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
    if (syllabusContent?.totalQuizzes) {
      contentArray.push({
        name: 'quizzes',
        total: syllabusContent.totalQuizzes,
        completed: syllabusContent.completedQuizzes,
      });
    }
    return contentArray;
  };

  const existsMentors = assistants?.length > 0 || isNumber(teacher?.id);
  const countOfMentors = assistants?.length + (teacher?.id ? 1 : 0);

  const ProjectsSection = () => (syllabusArray()?.length > 0 || assistants?.length > 0) && (
    <Flex justifyContent="space-between" alignItems="center" marginTop="10px" padding="10px" borderRadius="5px" background={bgColor}>
      {syllabusArray()?.length > 0 && (
        <Box display="flex" flexDirection="column" gridGap="8px">
          {syllabusArray().map((elem) => (
            <Text
              fontSize="xs"
              lineHeight="14px"
              fontWeight="700"
              color={textColor}
              key={elem?.name}
              display="flex"
            >
              <Icon
                width="14px"
                height="14px"
                style={{ marginRight: '7px' }}
                icon="book"
              />
              <Box>
                {isBought && (
                <>
                  <span style={{ color: CustomTheme.colors.blue.default2 }}>{elem.completed || 0}</span>
                  /
                </>
                )}
                {`${elem.total} ${programCardTR?.[elem.name] || t(elem.name)}`}
              </Box>
            </Text>
          ))}
        </Box>
      )}
      {existsMentors && (
        <Box>
          <Text
            fontSize="xs"
            lineHeight="14px"
            fontWeight="700"
            color={textColor}
            marginBottom="5px"
            textAlign="center"
          >
            {`${countOfMentors} ${programCardTR?.['mentors-available'] || t('mentors-available')}`}
          </Text>

          <Box display="flex" justifyContent="space-between" mt="10px" gridGap="22px">
            {teacher?.id && (
              <AvatarUser
                width="42px"
                height="42px"
                key={`${teacher.id} - ${teacher.user.first_name}`}
                fullName={`${teacher?.user?.first_name} ${teacher?.user?.last_name}`}
                data={teacher}
                isOnline={usersConnected?.includes(teacher.user.id)}
                badge
                customBadge={(
                  <Box position="absolute" bottom="-6px" right="-8px" background="blue.default" borderRadius="50px" p="5px" border="2px solid white">
                    <Icon icon="teacher1" width="12px" height="12px" color="#FFFFFF" />
                  </Box>
                )}
              />
            )}
            {assistants?.length > 0 && (
              <AvatarGroup max={assistants?.length <= 2 ? 2 : 1} size="md">
                {assistants?.map((c, i) => {
                  const fullName = `${c.user.first_name} ${c.user.last_name}`;
                  const isOnline = usersConnected?.includes(c.user.id);
                  return (
                    <Fragment key={`${c.id} - ${fullName}`}>
                      <AvatarUser
                        width="42px"
                        height="42px"
                        index={i}
                        // key={`${c.id} - ${c.user.first_name}`}
                        isWrapped
                        fullName={fullName}
                        data={c}
                        isOnline={isOnline}
                        badge
                      />
                    </Fragment>
                  );
                })}
              </AvatarGroup>
            )}
          </Box>
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
      width={width}
      padding="15px"
      position="relative"
      height="min-content"
    >
      <Box position="absolute" borderRadius="full" top="-30px" background={iconBackground} padding="10px">
        <Icon
          width="32px"
          height="32px"
          icon={icon}
        />
      </Box>

      {!isHiddenOnPrework && (
        <Flex height="30px" id="upper-left-section" flexDirection="row-reverse">
          {isLoading ? (
            <></>
          ) : (
            <>
              {!isBought ? (
                <Flex width="116px" justifyContent="flex-end">
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
                    {isValidDate(startsIn) && (
                      <Text
                        fontSize="9px"
                        lineHeight="9.8px"
                        fontWeight="400"
                        color={textColor}
                      >
                        {formatTimeString(new Date(startsIn))}
                      </Text>
                    )}
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
      )}
      <Text
        fontSize="md"
        lineHeight="19px"
        fontWeight="700"
        color={textColor}
        marginBottom="10px"
        marginTop={isHiddenOnPrework && '30px'}
      >
        {programName}
        {' '}
      </Text>

      {!isHiddenOnPrework ? (
        <>
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
                    onClick={handleChoose}
                  >
                    {programCardTR?.['start-course'] || t('start-course')}
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
                      {programCardTR?.['free-trial'] || t('free-trial')}
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
                        <Button variant="link" onClick={handleChoose} gridGap="6px" fontWeight={700}>
                          {isNumber(String(lessonNumber))
                            ? `${programCardTR?.continue || t('continue')} ${lessonNumber} →`
                            : `${programCardTR?.['continue-course'] || t('continue-course')} →`}
                        </Button>
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
                      {programCardTR?.upgrade || t('upgrade')}
                    </Button>
                  )}
                </Box>
              )}
            </>
          )}
        </>
      ) : (
        <Box width="100%" display="flex" justifyContent="center">
          <Text
            size="12px"
            color={lightColor}
          >
            {programCardTR?.['prework-message'] || t('prework-message')}
          </Text>
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
  courseProgress: PropTypes.number,
  stTranslation: PropTypes.objectOf(PropTypes.any),
  lessonNumber: PropTypes.number,
  isLoading: PropTypes.bool,
  width: PropTypes.string,
  usersConnected: PropTypes.arrayOf(PropTypes.number),
  assistants: PropTypes.arrayOf(PropTypes.any),
  teacher: PropTypes.objectOf(PropTypes.any),
  iconBackground: PropTypes.string,
  handleChoose: PropTypes.func,
  isHiddenOnPrework: PropTypes.bool,
};

ProgramCard.defaultProps = {
  stTranslation: null,
  programDescription: null,
  startsIn: null,
  haveFreeTrial: false,
  isBought: false,
  isFreeTrial: false,
  syllabusContent: null,
  courseProgress: null,
  freeTrialExpireDate: null,
  lessonNumber: null,
  isLoading: false,
  width: '292px',
  usersConnected: [],
  assistants: [],
  teacher: null,
  iconBackground: '',
  handleChoose: () => {},
  isHiddenOnPrework: false,
};

export default ProgramCard;

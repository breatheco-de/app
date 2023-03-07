import PropTypes from 'prop-types';
import {
  Box,
  useColorModeValue,
  Button,
  Flex,
  Progress,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { formatDuration, intervalToDuration, subMinutes } from 'date-fns';
import { es, en } from 'date-fns/locale';
import CustomTheme from '../../../styles/theme';
import Text from './Text';
import Icon from './Icon';
import { isNumber, isValidDate } from '../../utils';
import useStyle from '../hooks/useStyle';
import ProjectsSection from './ProjectsSection';

const availableLanguages = {
  es,
  en,
};

const ProgramCard = ({
  programName, programDescription, haveFreeTrial, startsIn, icon, iconBackground, stTranslation,
  syllabusContent, freeTrialExpireDate, courseProgress, lessonNumber, isLoading,
  width, usersConnected, assistants, teacher, handleChoose, isHiddenOnPrework, onOpenModal, isAvailableAsSaas,
  subscriptionStatus,
}) => {
  const { t, lang } = useTranslation('program-card');
  const textColor = useColorModeValue('black', 'white');
  const freeTrialExpireDateValue = isValidDate(freeTrialExpireDate) ? new Date(freeTrialExpireDate) : new Date(subMinutes(new Date(), 1));
  const now = new Date();
  const { lightColor, hexColor } = useStyle();
  const isFreeTrial = subscriptionStatus === 'FREE_TRIAL';
  const isCancelled = subscriptionStatus === 'CANCELLED' || subscriptionStatus === 'PAYMENT_ISSUE';
  const isExpired = isFreeTrial && freeTrialExpireDateValue < now;
  const statusActive = subscriptionStatus === 'ACTIVE' || subscriptionStatus === 'FULLY_PAID';
  // const statusActive = subscriptionStatus === 'ACTIVE' || isFreeTrial || subscriptionStatus === 'FULLY_PAID';

  const programCardTR = stTranslation?.[lang]?.['program-card'];

  const statusTimeString = (start) => {
    if (start < now) return 'started';
    return 'idle';
  };
  const hasStarted = statusTimeString(new Date(startsIn)) === 'started';

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
    // if (start < now) return stTranslation ? stTranslation[lang]['program-card'].started : t('started');
    return formated;
  };

  const statusLabel = {
    active: t('status.active'),
    fully_paid: t('status.fully-paid'),
    expired: t('status.expired'),
    cancelled: t('status.cancelled'),
    payment_issue: t('status.payment-issue'),
  };

  const FreeTagCapsule = () => {
    let timeString = '';
    const duration = intervalToDuration({
      end: now,
      start: freeTrialExpireDateValue,
    });
    const hours = duration?.hours;
    const formated = formatDuration(duration,
      {
        format: ['days'],
        locale: availableLanguages[lang],
      });

    if (isExpired) timeString = stTranslation ? stTranslation[lang]['program-card']['non-left'] : t('non-left');
    else if (duration.days > 0) timeString = `${formated} ${stTranslation ? stTranslation[lang]['program-card'].left : t('left')}`;
    else if (duration.days === 0 && hours >= 0) timeString = `${hours > 0 ? `${hours}h ${t('common:and')}` : ''} ${duration?.minutes}min`;
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
              {isAvailableAsSaas && statusActive && subscriptionStatus !== 'FREE_TRIAL' ? (
                <Flex width="116px" justifyContent="flex-end">
                  <Box marginRight="10px">
                    <Icon
                      width="14px"
                      height="21px"
                      icon="rocket"
                      color={hasStarted ? hexColor.blueDefault : ''}
                    />
                  </Box>
                  <Box>
                    <Text
                      fontSize="9px"
                      lineHeight="9.8px"
                      fontWeight="600"
                      color={textColor}
                    >
                      {hasStarted
                        ? `${stTranslation ? stTranslation[lang]['program-card']['started-in'] : t('started-in')}`
                        : `${stTranslation ? stTranslation[lang]['program-card']['starts-in'] : t('starts-in')}`}

                    </Text>
                    <Text
                      fontSize="9px"
                      lineHeight="9.8px"
                      fontWeight="400"
                      color={textColor}
                    >
                      {formatTimeString(new Date(startsIn))}
                    </Text>
                  </Box>
                </Flex>
              ) : (
                <>
                  {isAvailableAsSaas && isFreeTrial ? (
                    <FreeTagCapsule />
                  ) : (
                    <>
                      {!isCancelled || !isAvailableAsSaas ? (
                        <Icon icon="crown" width="22px" height="15px" />
                      ) : (
                        <Box fontSize="12px" display="flex" alignItems="center" background="red.light" color="danger" height="22px" borderRadius="20px" padding="0 10px">
                          {statusLabel[subscriptionStatus.toLowerCase()]}
                        </Box>
                      )}
                      {/* {!isAvailableAsSaas && (
                      )} */}
                    </>
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
              {!hasStarted && statusActive ? (
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
                <Box marginTop={courseProgress > 0}>
                  {courseProgress <= 0 && (
                    <Text
                      fontSize="xs"
                      lineHeight="14px"
                      fontWeight="500"
                      color={textColor}
                    >
                      {programDescription}
                      {' '}
                    </Text>
                  )}
                  <Box margin="auto" width="90%">
                    {courseProgress > 0 && (
                      <Box margin="20px 0 0 0">
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
                    )}
                  </Box>
                  {(!isExpired || !isAvailableAsSaas) && (
                    <>
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
                      <Text
                        marginTop="20px"
                        color={CustomTheme.colors.blue.default}
                        textAlign="center"
                        fontSize="xs"
                        lineHeight="14px"
                        fontWeight="700"
                      >
                        {courseProgress > 0 ? (
                          <Button variant="link" onClick={handleChoose} gridGap="6px" fontWeight={700}>
                            {isNumber(String(lessonNumber))
                              ? `${programCardTR?.continue || t('continue')} ${lessonNumber} →`
                              : `${programCardTR?.['continue-course'] || t('continue-course')} →`}
                          </Button>

                        ) : (
                          <>
                            {(!isAvailableAsSaas || !isCancelled) && (
                            <Button
                              borderRadius="3px"
                              width="100%"
                              padding="0"
                              whiteSpace="normal"
                              variant="default"
                              onClick={handleChoose}
                            >
                              {programCardTR?.['start-course'] || t('start-course')}
                            </Button>
                            )}
                          </>
                        )}
                      </Text>
                    </>
                  )}
                  {/* {isAvailableAsSaas && isFreeTrial && ( */}
                  {((isAvailableAsSaas && isFreeTrial) || (isAvailableAsSaas && !statusActive)) && (
                    <Button
                      marginTop={!isCancelled && courseProgress > 0 && '25px'}
                      borderRadius="3px"
                      width="100%"
                      padding="0"
                      whiteSpace="normal"
                      onClick={onOpenModal}
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
  haveFreeTrial: PropTypes.bool,
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
  onOpenModal: PropTypes.func,
  isAvailableAsSaas: PropTypes.bool,
  subscriptionStatus: PropTypes.string,
};

ProgramCard.defaultProps = {
  stTranslation: null,
  programDescription: null,
  startsIn: null,
  haveFreeTrial: false,
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
  onOpenModal: () => {},
  isAvailableAsSaas: true,
  subscriptionStatus: '',
};

export default ProgramCard;

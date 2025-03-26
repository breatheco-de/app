/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-no-useless-fragment */
import PropTypes from 'prop-types';
import {
  Box,
  useColorModeValue,
  Button,
  Flex,
  Progress,
  Image,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { formatDuration, intervalToDuration, subMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { memo, useState } from 'react';
import CustomTheme from '../../../styles/theme';
import Text from './Text';
import Icon from './Icon';
import { isNumber, isValidDate } from '../../utils';
import useStyle from '../hooks/useStyle';
import ProjectsSection from './ProjectsSection';
import ButtonHandler from '../../js_modules/profile/Subscriptions/ButtonHandler';

function FreeTagCapsule({ isExpired, freeTrialExpireDateValue, now, lang }) {
  const { t } = useTranslation('program-card');
  let timeString = '';
  const duration = intervalToDuration({
    end: now,
    start: freeTrialExpireDateValue,
  });
  const hours = duration?.hours;
  const formated = {
    en: formatDuration(duration, { format: ['days'] }),
    es: formatDuration(
      duration,
      {
        format: ['days'],
        locale: es,
      },
    ),
  };

  if (isExpired) timeString = t('non-left');
  else if (duration.days > 0) timeString = `${formated[lang]} ${t('left')}`;
  else if (duration.days === 0 && hours >= 0) timeString = `${hours > 0 ? `${hours}h ${t('common:and')}` : ''} ${duration?.minutes}min`;
  else timeString = t('today');

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
}

function ProgramCard({
  programName, programDescription, haveFreeTrial, startsIn, endsAt, signInDate, icon, iconBackground,
  syllabusContent, freeTrialExpireDate, courseProgress, lessonNumber, isLoading,
  width, assistants, teacher, handleChoose, isHiddenOnPrework, isAvailableAsSaas,
  subscriptionStatus, subscription, isMarketingCourse, iconLink, bullets, background, isFinantialStatusLate, isLoadingPageContent,
}) {
  const { t, lang } = useTranslation('program-card');
  const textColor = useColorModeValue('black', 'white');
  const [showAllBullets, setShowAllBullets] = useState(false);

  const freeTrialExpireDateValue = isValidDate(freeTrialExpireDate) ? new Date(freeTrialExpireDate) : new Date(subMinutes(new Date(), 1));
  const now = new Date();
  const { backgroundColor, lightColor, hexColor } = useStyle();
  const isFreeTrial = isAvailableAsSaas && subscriptionStatus === 'FREE_TRIAL';
  const isCancelled = isAvailableAsSaas && (subscriptionStatus === 'CANCELLED' || subscriptionStatus === 'PAYMENT_ISSUE');
  const isExpired = isFreeTrial && freeTrialExpireDateValue < now;
  const isNeverEnding = !endsAt;
  const statusActive = subscriptionStatus === 'ACTIVE' || subscriptionStatus === 'FULLY_PAID';
  const isError = subscriptionStatus === 'ERROR';
  const expiredStatus = subscriptionStatus === 'EXPIRED';
  // const statusActive = subscriptionStatus === 'ACTIVE' || isFreeTrial || subscriptionStatus === 'FULLY_PAID';

  const statusTimeString = (start) => {
    if (start < now) return 'started';
    return 'idle';
  };
  const hasStarted = statusTimeString(new Date(startsIn)) === 'started';
  const getStartsInDate = () => {
    if (isNeverEnding && isValidDate(signInDate)) return new Date(signInDate);
    if (isValidDate(startsIn)) return new Date(startsIn);
    return null;
  };
  const startsInDate = getStartsInDate();

  const formatTimeString = (start) => {
    const duration = intervalToDuration({
      end: now,
      start,
    });

    if (duration.days > 0) duration.hours = 0;
    const formated = {
      en: formatDuration(
        duration,
        {
          format: ['months', 'weeks', 'days', 'hours'],
          delimiter: ', ',
        },
      ),
      es: formatDuration(
        duration,
        {
          format: ['months', 'weeks', 'days', 'hours'],
          delimiter: ', ',
          locale: es,
        },
      ),
    };

    if (formated[lang] === '') return t('starting-today');
    // if (start < now) return t('started');
    return formated[lang];
  };

  const statusLabel = {
    active: t('status.active'),
    fully_paid: t('status.fully_paid'),
    expired: t('status.expired'),
    cancelled: t('status.cancelled'),
    payment_issue: t('status.payment_issue'),
    error: t('status.error'),
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
      background={background}
    >
      {iconLink ? (
        <Box position="absolute" borderRadius="full" top="-30px" padding="10px">
          <Image src={iconLink} width="44px" height="44px" borderRadius="50%" />
        </Box>
      ) : (
        <Box position="absolute" top="-30px" padding="10px">
          <Box borderRadius="full" background={iconBackground} padding="10px">
            <Icon
              width="24px"
              height="24px"
              icon={icon}
            />
          </Box>
        </Box>
      )}

      {!isHiddenOnPrework && !isMarketingCourse && (
        <Flex height="30px" id="upper-left-section" flexDirection="row-reverse">
          {isLoading ? (
            <></>
          ) : (
            <>
              {isAvailableAsSaas && statusActive && subscriptionStatus !== 'FREE_TRIAL' ? (
                <>
                  {courseProgress === 0 ? (
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
                            ? `${t('started-in')}`
                            : `${t('starts-in')}`}

                        </Text>
                        <Text
                          fontSize="9px"
                          lineHeight="9.8px"
                          fontWeight="400"
                          color={textColor}
                        >
                          {formatTimeString(startsInDate)}
                        </Text>
                      </Box>
                    </Flex>

                  ) : (
                    <Icon icon="crown" width="22px" height="15px" />
                  )}
                </>
              ) : (
                <>
                  {isAvailableAsSaas && isFreeTrial ? (
                    <>
                      {hasStarted ? (
                        <FreeTagCapsule
                          isExpired={isExpired}
                          freeTrialExpireDateValue={freeTrialExpireDateValue}
                          now={now}
                          lang={lang}
                        />
                      ) : (
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
                                ? `${t('started-in')}`
                                : `${t('starts-in')}`}

                            </Text>
                            <Text
                              fontSize="9px"
                              lineHeight="9.8px"
                              fontWeight="400"
                              color={textColor}
                            >
                              {formatTimeString(startsInDate)}
                            </Text>
                          </Box>
                        </Flex>
                      )}
                    </>
                  ) : (
                    <>
                      {(!isCancelled || isAvailableAsSaas === false) && !isError && !expiredStatus ? (
                        <Icon icon="crown" width="22px" height="15px" />
                      ) : (
                        <Box fontSize="12px" display="flex" alignItems="center" background="red.light" color="danger" height="22px" borderRadius="20px" padding="0 10px">
                          {statusLabel[subscriptionStatus.toLowerCase()]}
                        </Box>
                      )}
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
        marginTop={(isHiddenOnPrework || isMarketingCourse) && '30px'}
      >
        {programName}
        {' '}
      </Text>

      {!isHiddenOnPrework && !isMarketingCourse ? (
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
              {((!hasStarted && courseProgress === 0) && statusActive) || ((!hasStarted && courseProgress === 0) && isFreeTrial) ? (
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
                    syllabusContent={syllabusContent}
                    courseProgress={courseProgress}
                    assistants={assistants}
                    teacher={teacher}
                    isAvailableAsSaas={isAvailableAsSaas}
                    subscriptionStatus={subscriptionStatus}
                  />
                  {isFreeTrial && isExpired ? (
                    <ButtonHandler
                      subscription={subscription}
                      onOpenCancelSubscription={() => {}}
                      // ------------------
                      marginTop={!isCancelled && '20px'}
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
                      {t('upgrade')}
                    </ButtonHandler>
                  ) : (
                    <Button
                      marginTop="20px"
                      borderRadius="3px"
                      width="100%"
                      padding="0"
                      whiteSpace="normal"
                      variant={isFinantialStatusLate ? 'danger' : 'default'}
                      onClick={handleChoose}
                      isLoading={isLoadingPageContent}
                    >
                      {t('start-course')}
                    </Button>
                  )}
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
                      {t('free-trial')}
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
                  <ProjectsSection
                    startsIn={startsIn}
                    syllabusContent={syllabusContent}
                    courseProgress={courseProgress}
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
                    {!isExpired && (
                      <>
                        {(courseProgress > 0 && !isCancelled) ? (
                          <Button
                            variant={isFinantialStatusLate ? 'danger' : 'link'}
                            onClick={handleChoose}
                            width="100%"
                            isLoading={isLoadingPageContent}
                            gridGap="6px"
                            fontWeight={700}
                          >
                            {isFinantialStatusLate && t('action-required')}
                            {!isFinantialStatusLate && (isNumber(String(lessonNumber))
                              ? `${t('continue')} ${lessonNumber} →`
                              : `${t('continue-course')} →`)}
                          </Button>

                        ) : (
                          <>
                            {(!isAvailableAsSaas || !isCancelled) && !isError && !expiredStatus && (
                            <Button
                              borderRadius="3px"
                              width="100%"
                              padding="0"
                              whiteSpace="normal"
                              variant={isFinantialStatusLate ? 'danger' : 'default'}
                              mb={isAvailableAsSaas && !statusActive && '10px'}
                              onClick={handleChoose}
                              isLoading={isLoadingPageContent}
                            >
                              {isFinantialStatusLate
                                ? t('action-required')
                                : t('start-course')}
                            </Button>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </Text>

                  {((isAvailableAsSaas && isFreeTrial) || (isAvailableAsSaas && !statusActive)) && (
                    <ButtonHandler
                      subscription={subscription}
                      onOpenCancelSubscription={() => {}}
                      // ------------------
                      marginTop={!isCancelled && !isExpired && courseProgress > 0 && '5px'}
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
                      {t('upgrade')}
                    </ButtonHandler>
                  )}
                </Box>
              )}
            </>
          )}
        </>
      ) : (
        <>
          {isMarketingCourse ? (
            <>
              <Box width="100%" display="flex" justifyContent="center">
                <Text
                  size="sm"
                  fontWeight={500}
                  mb="10px"
                >
                  {programDescription}
                </Text>
              </Box>
              {bullets?.length > 0 && (
                <Flex flexDirection="column" gridGap="8px" background={backgroundColor} padding="10px 12px" borderRadius="4px">
                  {bullets.slice(0, showAllBullets ? bullets.length : 4).map((l) => (
                    <Box key={l.name} display="flex" fontWeight={700} fontSize="14px" gridGap="10px" alignItems="center">
                      <Icon icon="checked2" color={hexColor.green} width="14px" height="14px" />
                      {l.name}
                    </Box>
                  ))}
                  {bullets.length > 4 && (
                    <Button
                      variant="link"
                      onClick={() => setShowAllBullets(!showAllBullets)}
                      color={hexColor.blueDefault}
                      fontSize="14px"
                      fontWeight={700}
                      padding="4px 0"
                      _hover={{ textDecoration: 'none' }}
                      display="flex"
                      alignItems="center"
                    >
                      {showAllBullets ? t('see-less') : t('see-more')}
                    </Button>
                  )}
                </Flex>
              )}
              <Button
                borderRadius="3px"
                width="100%"
                padding="0"
                whiteSpace="normal"
                variant="default"
                mt="20px"
                onClick={handleChoose}
                isLoading={isLoadingPageContent}
              >
                {t('learn-more')}
              </Button>
            </>
          ) : (
            <Box width="100%" display="flex" justifyContent="center">
              <Text
                size="12px"
                color={lightColor}
              >
                {t('prework-message')}
              </Text>
            </Box>
          )}
        </>

      )}
    </Box>
  );
}

ProgramCard.propTypes = {
  programName: PropTypes.string.isRequired,
  programDescription: PropTypes.string,
  startsIn: PropTypes.instanceOf(Date),
  endsAt: PropTypes.instanceOf(Date),
  signInDate: PropTypes.instanceOf(Date),
  freeTrialExpireDate: PropTypes.instanceOf(Date),
  haveFreeTrial: PropTypes.bool,
  icon: PropTypes.string.isRequired,
  syllabusContent: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  courseProgress: PropTypes.number,
  lessonNumber: PropTypes.number,
  isLoading: PropTypes.bool,
  width: PropTypes.string,
  assistants: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  teacher: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  iconBackground: PropTypes.string,
  handleChoose: PropTypes.func,
  isHiddenOnPrework: PropTypes.bool,
  isMarketingCourse: PropTypes.bool,
  iconLink: PropTypes.string,
  // onOpenModal: PropTypes.func,
  isAvailableAsSaas: PropTypes.bool,
  subscriptionStatus: PropTypes.string,
  subscription: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  bullets: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  background: PropTypes.string,
  isLoadingPageContent: PropTypes.bool,
  isFinantialStatusLate: PropTypes.bool,
};

ProgramCard.defaultProps = {
  programDescription: null,
  startsIn: null,
  endsAt: null,
  signInDate: null,
  haveFreeTrial: false,
  syllabusContent: null,
  courseProgress: null,
  freeTrialExpireDate: null,
  lessonNumber: null,
  isLoading: false,
  width: '292px',
  assistants: [],
  teacher: null,
  iconBackground: '',
  handleChoose: () => {},
  isHiddenOnPrework: false,
  isMarketingCourse: false,
  iconLink: '',
  isAvailableAsSaas: false,
  subscriptionStatus: '',
  subscription: {},
  bullets: [],
  background: '',
  isLoadingPageContent: false,
  isFinantialStatusLate: false,
};

export default memo(ProgramCard);

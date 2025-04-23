import { useColorModeValue, Box, Button, Heading } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import { useRouter } from 'next/router';
import CustomTheme from '../../../styles/theme';
import Text from '../Text';
import Icon from '../Icon';
import MainEvent from './MainEvent';
import useLiveEvent from './useLiveEvent';

function LiveEventWidgetV2({
  mainClasses,
  otherEvents,
  startingSoonDelta,
  cohorts,
  ...rest
}) {
  const router = useRouter();
  const {
    t,
    eventTimeTexts,
    mainEvents,
    getOtherEventsResult,
    isLiveOrStarting,
    isLive,
    getLiveIcon,
    textTime,
    existsWhiteLabel,
    BREATHECODE_HOST,
    logoData,
    nearestEvent,
  } = useLiveEvent({ mainClasses, otherEvents, startingSoonDelta });

  const bgColor2 = useColorModeValue('featuredLight', 'featuredDark');
  const textColor = useColorModeValue('black', 'white');
  const textGrayColor = useColorModeValue('gray.600', 'gray.350');

  const allEvents = [...mainEvents, ...getOtherEventsResult].sort(
    (a, b) => new Date(a.starting_at) - new Date(b.starting_at),
  );

  const liveOrStartingSoonEvents = allEvents.filter((event) => (
    isLiveOrStarting(new Date(event?.starting_at), new Date((event?.ended_at || event?.ending_at)))
  ));

  const allUpcomingEvents = allEvents
    .filter((event) => !isLiveOrStarting(new Date(event?.starting_at), new Date((event?.ended_at || event?.ending_at))))
    .sort((a, b) => new Date(a.starting_at) - new Date(b.starting_at));

  let finalDisplayEvents = [...liveOrStartingSoonEvents, ...allUpcomingEvents];

  finalDisplayEvents = finalDisplayEvents.slice(0, 3);

  return (
    <Box padding="10px" width="100%" {...rest}>
      <Heading fontSize="14px" textAlign="center" mb={2} fontWeight="400">
        {t('upcoming-events')}
      </Heading>

      {finalDisplayEvents.length > 0 ? (
        <>
          {finalDisplayEvents.map((event) => {
            const isCurrentEventLiveOrStarting = isLiveOrStarting(new Date(event?.starting_at), new Date((event?.ended_at || event?.ending_at)));
            return (
              <Box
                key={event.id}
                background={isCurrentEventLiveOrStarting ? bgColor2 : useColorModeValue('white', 'gray.700')}
                border={isCurrentEventLiveOrStarting ? '2px solid' : '1px solid'}
                borderColor={isCurrentEventLiveOrStarting ? CustomTheme.colors.blue[50] : 'transparent'}
                padding="10px"
                borderRadius="lg"
                width="100%"
                mb={3}
              >
                <MainEvent
                  currentDateText={eventTimeTexts?.[event.id]}
                  event={event}
                  limitOfText={24}
                  mainEvents={mainEvents}
                  getOtherEvents={getOtherEventsResult}
                  isLiveOrStarting={isLiveOrStarting}
                  getLiveIcon={getLiveIcon}
                  host={BREATHECODE_HOST}
                  nearestEvent={nearestEvent}
                  allowedDivider={false}
                  isLive={isLive}
                  textTime={textTime}
                  isWorkshop={!event?.hash}
                  subLabel={event?.hash ? t('master-class') : t('workshop')}
                  mainClasses={mainClasses}
                  cohorts={cohorts}
                  layoutVariant="inline"
                />
              </Box>
            );
          })}
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          background={bgColor2}
          padding="10px"
          borderRadius="lg"
          width="100%"
          margin="auto"
          mb={3}
        >
          <Box
            borderRadius="full"
            background={bgColor2}
            opacity="0.5"
            padding="10px"
          >
            {existsWhiteLabel ? (
              <Image
                src={logoData?.logo_url || '/static/images/4geeks.png'}
                width={40}
                height={40}
                style={{
                  maxHeight: '40px',
                  minHeight: '40px',
                  objectFit: 'contain',
                }}
                alt={logoData?.name ? `${logoData.name} logo` : '4Geeks logo'}
              />
            ) : (
              <Icon
                width="34px"
                height="34px"
                icon="logoModern"
                color="currentColor"
              />
            )}
          </Box>
          <Box
            display="flex"
            justifyContent="center"
            flexDirection="column"
            marginLeft="10px"
          >
            <Text
              fontSize="md"
              lineHeight="18px"
              fontWeight="900"
              color={textColor}
              marginBottom="5px"
              marginTop="0"
            >
              {t('live-class')}
            </Text>
            <Text
              fontSize="12px"
              lineHeight="18px"
              fontWeight="700"
              color={textGrayColor}
              margin="0"
            >
              {t('no-live-class')}
            </Text>
          </Box>
        </Box>
      )}

      <Button
        variant="link"
        colorScheme="blue"
        fontSize="14px"
        fontWeight="700"
        display="block"
        margin="0 auto"
        onClick={() => {
          router.push('/workshops');
        }}
      >
        {t('common:see-all-events')}
      </Button>

    </Box>
  );
}

LiveEventWidgetV2.propTypes = {
  mainClasses: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  otherEvents: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  startingSoonDelta: PropTypes.number,
  cohorts: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
};

LiveEventWidgetV2.defaultProps = {
  mainClasses: [],
  otherEvents: [],
  startingSoonDelta: 30,
  cohorts: [],
};

export default LiveEventWidgetV2;

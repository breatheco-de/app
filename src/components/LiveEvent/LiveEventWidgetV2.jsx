import { useColorModeValue, Box, Button, VStack, Heading } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Text from '../Text';
import MainEvent from './MainEvent';
import useLiveEvent from './useLiveEvent';

function LiveEventWidgetV2({
  mainClasses,
  otherEvents,
  startingSoonDelta,
  cohorts,
}) {
  const {
    t,
    eventTimeTexts,
    mainEvents,
    getOtherEventsResult,
    isLiveOrStarting,
    isLive,
    getLiveIcon,
    textTime,
    BREATHECODE_HOST,
    nearestEvent,
  } = useLiveEvent({ mainClasses, otherEvents, startingSoonDelta });

  const combinedEvents = [
    ...mainEvents,
    ...getOtherEventsResult,
  ].sort((a, b) => new Date(a.starting_at) - new Date(b.starting_at));

  const displayEvents = combinedEvents.slice(0, 3);

  return (
    <Box padding="10px" maxWidth="100%">
      <Heading size="14px" textAlign="center" mb="8px">
        {t('upcoming-events')}
      </Heading>

      <VStack spacing={3} align="stretch">
        {displayEvents.length > 0 ? (
          displayEvents.map((event, index) => (
            <MainEvent
              key={event.id}
              currentDateText={eventTimeTexts?.[event.id]}
              index={index}
              event={event}
              mainEvents={displayEvents}
              getOtherEvents={[]}
              isLiveOrStarting={isLiveOrStarting}
              getLiveIcon={getLiveIcon}
              host={BREATHECODE_HOST}
              nearestEvent={nearestEvent}
              isLive={isLive}
              textTime={textTime}
              isWorkshop={!event?.hash}
              subLabel={event?.hash ? t('master-class') : t('workshop')}
              mainClasses={mainClasses}
              limitOfText={54}
              cohorts={cohorts}
            />
          ))
        ) : (
          <Text textAlign="center" color={useColorModeValue('gray.600', 'gray.400')}>
            {t('no-upcoming-events', 'No upcoming events.')}
          </Text>
        )}
      </VStack>

      <Button
        variant="link"
        colorScheme="blue"
        fontWeight="500"
        display="block"
        margin="0 auto"
      >
        {t('see-all-events', 'See all events')}
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

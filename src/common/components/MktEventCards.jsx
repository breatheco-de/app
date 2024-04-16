import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Flex } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import GridContainer from './GridContainer';
import Heading from './Heading';
import Icon from './Icon';
import axios from '../../axios';
import EventCard from './EventCard';
import DraggableContainer from './DraggableContainer';
import { sortToNearestTodayDate } from '../../utils';
import modifyEnv from '../../../modifyEnv';

function MktEventCards({ isSmall, externalEvents, hideDescription, id, title, hoursToLimit, endpoint, ...rest }) {
  const [events, setEvents] = useState([]);
  const router = useRouter();
  const lang = router.locale;
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });

  const hoursLimited = hoursToLimit * 60;
  const endpointDefault = endpoint || '/v1/events/all';
  const maxEvents = 10;

  useEffect(() => {
    if (externalEvents) {
      setEvents(externalEvents);
    } else {
      axios.get(`${BREATHECODE_HOST}${endpointDefault}`)
        .then((res) => {
          const data = res?.data;
          if (data && data.length > 0) {
            const englishLang = lang === 'en' && 'us';
            const sortDateToLiveClass = sortToNearestTodayDate(data, hoursLimited);
            const existentLiveClasses = sortDateToLiveClass?.filter((l) => l?.starting_at && (l?.ended_at || l?.ending_at) && l?.slug);
            const isMoreThanAnyEvents = existentLiveClasses?.length > maxEvents;
            const filteredByLang = existentLiveClasses?.filter((l) => l?.lang === englishLang || l?.lang === lang);

            // Filter by lang if there are more than ${maxEvents} events
            const eventsFiltered = isMoreThanAnyEvents ? filteredByLang : existentLiveClasses;
            setEvents(eventsFiltered);
          }
        });
    }
  }, [externalEvents]);

  return events?.length > 0 && (
    <GridContainer
      id={id}
      maxWidth="1280px"
      withContainer
      px="10px"
      padding={{ base: '0 10px', lg: '0' }}
      flexDirection={{ base: 'column', lg: 'row' }}
      gridColumn="1 / span 10"
      {...rest}
    >
      <Flex alignItems="center" gridGap="32px" marginBottom="32px">
        <Heading as="h2" fontWeight={700} style={{ fontSize: '38px' }}>
          {title}
        </Heading>
        <Icon icon="longArrowRight" width="58px" height="30px" />
      </Flex>
      <DraggableContainer className="hideOverflowX__" overflow="auto" position="relative" width="100%">
        <Flex gridGap="20px" width="max-content" margin="0">
          {events.map((event) => (
            <EventCard
              isSmall={isSmall}
              key={event?.id}
              language={event.lang}
              id={event?.id}
              slug={event?.slug}
              title={event?.title}
              host={event?.host}
              ignoreDynamicHandler
              description={hideDescription ? '' : event?.excerpt}
              technologies={event?.technologies || []}
              startingAt={event?.starting_at}
              endingAt={event?.ended_at || event?.ending_at}
            />
          ))}
        </Flex>
      </DraggableContainer>
    </GridContainer>
  );
}

MktEventCards.propTypes = {
  isSmall: PropTypes.bool,
  id: PropTypes.string,
  title: PropTypes.string,
  endpoint: PropTypes.string,
  hoursToLimit: PropTypes.number,
  externalEvents: PropTypes.oneOfType([PropTypes.array, PropTypes.any]),
  hideDescription: PropTypes.bool,
};

MktEventCards.defaultProps = {
  isSmall: false,
  id: 'UpcomingEvents',
  title: 'Starting soon',
  endpoint: '',
  hoursToLimit: 1440, // 60 days
  externalEvents: null,
  hideDescription: false,
};

export default MktEventCards;

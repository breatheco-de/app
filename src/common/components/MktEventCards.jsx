import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Flex } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import useStyle from '../hooks/useStyle';
import GridContainer from './GridContainer';
import Heading from './Heading';
import Icon from './Icon';
import axios from '../../axios';
import { sortToNearestTodayDate, getQueryString } from '../../utils';
import DraggableContainer from './DraggableContainer';
import DynamicContentCard from './DynamicContentCard';
import { WHITE_LABEL_ACADEMY, BREATHECODE_HOST } from '../../utils/variables';
import useAuth from '../hooks/useAuth';
import { parseQuerys } from '../../utils/url';

function MktEventCards({
  isSmall,
  externalEvents,
  hideDescription,
  id,
  title,
  hoursToLimit,
  endpoint,
  techFilter,
  searchSensitive,
  showCheckedInEvents,
  ...rest
}) {
  const [originalEvents, setOriginalEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [checkedInEvents, setCheckedInEvents] = useState([]);
  const { user } = useAuth();
  const { fontColor } = useStyle();
  const router = useRouter();
  const lang = router.locale;
  const search = getQueryString('search');
  const qsConnector = parseQuerys({
    featured: true,
    academy: WHITE_LABEL_ACADEMY,
    is_public: true,
  }, (endpoint && endpoint?.includes('?')));

  const hoursLimited = hoursToLimit * 60;
  const choosenEndpoint = endpoint || '/v1/events/all';
  const endpointDefault = `${choosenEndpoint}${qsConnector}`;
  const maxEvents = 10;

  const fetchCheckedInEvents = async (eventsArray) => {
    try {
      const checkedIn = await Promise.all(
        eventsArray.map(async (event) => {
          const res = await axios.get(`${BREATHECODE_HOST}/v1/events/event/${event.id}/checkin`);
          const reservations = res?.data || [];
          const isUserAttendee = reservations.find((reservation) => reservation?.attendee?.id === user.id);
          return isUserAttendee ? event : null;
        }),
      );
      setCheckedInEvents(checkedIn.filter(Boolean));
    } catch (error) {
      console.error('Error fetching checked-in events:', error);
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (externalEvents) {
          setOriginalEvents(externalEvents);
          setFilteredEvents(externalEvents);
          return;
        }
        const res = await axios.get(`${BREATHECODE_HOST}${endpointDefault}`);
        const data = res?.data;

        if (data && data.length > 0) {
          const englishLang = lang === 'en' && 'us';
          const sortDateToLiveClass = sortToNearestTodayDate(data, hoursLimited);
          const existentLiveClasses = sortDateToLiveClass?.filter((l) => l?.starting_at && (l?.ended_at || l?.ending_at) && l?.slug);
          const isMoreThanAnyEvents = existentLiveClasses?.length > maxEvents;
          const filteredByLang = existentLiveClasses?.filter((l) => l?.lang === englishLang || l?.lang === lang);

          const eventsFilteredByLang = isMoreThanAnyEvents ? filteredByLang : existentLiveClasses;

          const eventsFilteredByTech = techFilter ? eventsFilteredByLang.filter((event) => event?.event_type?.technologies?.split(',').includes(techFilter.toLowerCase())) : eventsFilteredByLang;

          if (showCheckedInEvents && user?.id && eventsFilteredByTech.length > 0) {
            fetchCheckedInEvents(eventsFilteredByTech);
            return;
          }

          setOriginalEvents(eventsFilteredByTech);
          setFilteredEvents(eventsFilteredByTech);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [externalEvents, techFilter]);

  useEffect(() => {
    if (!searchSensitive || techFilter) return;

    if (!search) {
      setFilteredEvents(originalEvents);
      return;
    }

    const filteredBySearch = originalEvents.filter((event) => event?.title?.toLowerCase().includes(search.toLowerCase())
      || event?.event_type?.technologies?.includes(search.toLowerCase()));

    setFilteredEvents(filteredBySearch);
  }, [search, searchSensitive, originalEvents]);

  const eventsToDisplay = showCheckedInEvents ? checkedInEvents : filteredEvents;

  return eventsToDisplay?.length > 0 && (
    <>
      <GridContainer
        id={id}
        maxWidth="1280px"
        withContainer
        padding={{ base: '0 10px', lg: '0' }}
        px={{ base: '10px', md: '2rem' }}
        flexDirection={{ base: 'column', lg: 'row' }}
        gridColumn="1 / span 10"
        {...rest}
      >
        <Flex alignItems="center" gridGap="32px" marginBottom="26px" justifyContent="space-between">
          <Heading as="h2" fontWeight={700} fontSize="38px">
            {title}
          </Heading>
          <Icon icon="longArrowRight" width="58px" height="30px" color={fontColor} />
        </Flex>
        <DraggableContainer className="hideOverflowX__" position="relative" width="100%" padding="7px 6px">
          <Flex gridGap="20px" width="max-content">
            {eventsToDisplay.map((event) => (
              <DynamicContentCard
                type="workshop"
                data={event}
                maxHeight="256px"
                userSelect="none"
                transition="transform 0.15s ease-in-out"
                _hover={{
                  transform: 'scale(1.03)',
                }}
              />
            ))}
          </Flex>
        </DraggableContainer>
      </GridContainer>
    </>
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
  searchSensitive: PropTypes.bool,
  techFilter: PropTypes.string,
  showCheckedInEvents: PropTypes.bool,
};

MktEventCards.defaultProps = {
  isSmall: false,
  id: 'UpcomingEvents',
  title: 'Starting soon',
  endpoint: '',
  hoursToLimit: 1440,
  externalEvents: null,
  hideDescription: false,
  searchSensitive: false,
  techFilter: null,
  showCheckedInEvents: false,
};

export default MktEventCards;

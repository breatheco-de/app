import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Flex, Skeleton } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import useStyle from '../hooks/useStyle';
import GridContainer from './GridContainer';
import Heading from './Heading';
import Icon from './Icon';
import axios from '../../axios';
import { getQueryString, sortToNearestTodayDate } from '../../utils';
import DraggableContainer from './DraggableContainer';
import DynamicContentCard from './DynamicContentCard';
import { WHITE_LABEL_ACADEMY, BREATHECODE_HOST } from '../../utils/variables';
import bc from '../../services/breathecode';
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
  sortPrioOneTechs,
  ...rest
}) {
  const [originalEvents, setOriginalEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [checkedInEvents, setCheckedInEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation('workshops');
  const { user } = useAuth();
  const { fontColor } = useStyle();
  const router = useRouter();
  const lang = router.locale;
  const search = getQueryString('search');
  const qsConnector = parseQuerys({
    featured: true,
    academy: WHITE_LABEL_ACADEMY,
    is_public: true,
    status: techFilter ? 'ACTIVE,FINISHED' : 'ACTIVE',
    past: !!techFilter,
  }, (endpoint && endpoint?.includes('?')));

  const hoursLimited = hoursToLimit * 60;
  const choosenEndpoint = endpoint || '/v1/events/all';
  const endpointDefault = `${choosenEndpoint}${qsConnector}`;
  const maxEvents = 10;

  const fetchCheckedInEvents = async () => {
    try {
      const res = await bc.events().meCheckin();
      const userEvents = res?.data || [];
      const userEventsSorted = sortToNearestTodayDate(userEvents, hoursLimited, true);
      setCheckedInEvents(userEventsSorted);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching checked-in events:', error);
      setLoading(false);
    }
  };

  const transformEventsWithTechnologies = (events, technologiesList) => events.map((event) => {
    const techSlugs = event.event_type?.technologies
      ? event.event_type.technologies.split(',').map((tech) => tech.trim())
      : [];

    const formattedTechnologies = techSlugs.map((slug) => technologiesList.find((tech) => tech.slug === slug) || null).filter(Boolean);

    return { ...event, technologies: formattedTechnologies };
  });

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        if (externalEvents) {
          setOriginalEvents(externalEvents);
          setFilteredEvents(externalEvents);
          setLoading(false);
          return;
        }
        const res = await axios.get(`${BREATHECODE_HOST}${endpointDefault}`);
        const data = res?.data;

        if (data && data.length > 0) {
          const englishLang = lang === 'en' && 'us';
          const sortDateToLiveClass = techFilter ? sortToNearestTodayDate(data, hoursLimited, true) : sortToNearestTodayDate(data, hoursLimited);
          const existentLiveClasses = sortDateToLiveClass?.filter((l) => l?.starting_at && (l?.ended_at || l?.ending_at) && l?.slug);
          const isMoreThanAnyEvents = sortDateToLiveClass?.length > maxEvents;
          const filteredByLang = existentLiveClasses?.filter((l) => l?.lang === englishLang || l?.lang === lang);

          const eventsFilteredByLang = isMoreThanAnyEvents ? filteredByLang : existentLiveClasses;
          const eventsWithTechnologies = transformEventsWithTechnologies(eventsFilteredByLang, sortPrioOneTechs);

          const eventsFilteredByTech = techFilter ? eventsWithTechnologies.filter((event) => event?.event_type?.technologies?.split(',').includes(techFilter.toLowerCase())) : eventsWithTechnologies;

          setOriginalEvents(eventsFilteredByTech);
          setFilteredEvents(eventsFilteredByTech);

          if (showCheckedInEvents && user?.id) {
            fetchCheckedInEvents();
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setLoading(false);
      }
    };

    fetchEvents();
  }, [externalEvents, techFilter, sortPrioOneTechs]);

  useEffect(() => {
    if (!searchSensitive || techFilter) return undefined;

    if (search) {
      setLoading(true);
      const delay = setTimeout(() => {
        const filteredBySearch = originalEvents.filter((event) => (
          event?.title?.toLowerCase().includes(search.toLowerCase())
          || event?.event_type?.technologies?.includes(search.toLowerCase())
          || event?.event_type?.name?.toLowerCase().includes(search.toLowerCase())
        ));
        setFilteredEvents(filteredBySearch);
        setLoading(false);
      }, 300);
      return () => clearTimeout(delay);
    }

    setFilteredEvents(originalEvents);
    setLoading(false);
    return undefined;
  }, [search, searchSensitive, originalEvents]);

  const renderTitle = () => {
    if (searchSensitive && search && loading) return t('searching-for', { search });
    if (searchSensitive && search && !loading && filteredEvents.length === 0) return t('search-not-found', { search });
    if (searchSensitive && search && !loading && filteredEvents.length > 0) return t('search-found', { search });
    if (techFilter) return `${t('tech-event', { tech: techFilter })}`;
    return title;
  };

  const eventsToDisplay = showCheckedInEvents ? checkedInEvents : filteredEvents;

  return (
    <>
      {loading ? (
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
              {renderTitle()}
            </Heading>
            <Icon icon="longArrowRight" width="58px" height="30px" color={fontColor} />
          </Flex>
          <DraggableContainer className="hideOverflowX__" position="relative" width="100%" padding="7px 6px">
            <Flex gridGap="20px" width="max-content">
              <Skeleton height="200px" width="370px" borderRadius="10px" />
              <Skeleton height="200px" width="370px" borderRadius="10px" />
              <Skeleton height="200px" width="370px" borderRadius="10px" />
              <Skeleton height="200px" width="370px" borderRadius="10px" />
            </Flex>
          </DraggableContainer>
        </GridContainer>
      ) : (
        <>
          {eventsToDisplay?.length > 0 && (
            <GridContainer
              id={id}
              maxWidth="1280px"
              withContainer
              px={{ base: '10px', md: '2rem' }}
              flexDirection={{ base: 'column', lg: 'row' }}
              gridColumn="1 / span 10"
              {...rest}
            >
              <Flex alignItems="center" gridGap="32px" marginBottom="26px" justifyContent="space-between">
                <Heading as="h2" fontWeight={700} fontSize="38px">
                  {renderTitle()}
                </Heading>
                <Icon icon="longArrowRight" width="58px" height="30px" color={fontColor} />
              </Flex>
              <DraggableContainer className="hideOverflowX__" position="relative" width="100%" padding="7px 6px">
                <Flex gridGap="20px" width="max-content">
                  {eventsToDisplay.map((event) => (
                    <DynamicContentCard
                      key={event.id}
                      type="workshop"
                      data={event}
                      technologies={event?.technologies}
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
          )}
          {eventsToDisplay?.length === 0 && searchSensitive && search?.length > 0 && (
            <GridContainer
              id={id}
              maxWidth="1280px"
              withContainer
              px={{ base: '10px', md: '2rem' }}
              flexDirection={{ base: 'column', lg: 'row' }}
              gridColumn="1 / span 10"
              {...rest}
            >
              <Flex alignItems="center" gridGap="32px" marginBottom="26px" justifyContent="space-between">
                <Heading as="h2" fontWeight={700} fontSize="38px">
                  {renderTitle()}
                </Heading>
                <Icon icon="longArrowRight" width="58px" height="30px" color={fontColor} />
              </Flex>
            </GridContainer>
          )}
        </>
      )}
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
  sortPrioOneTechs: PropTypes.oneOfType([PropTypes.array, PropTypes.any]),
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
  sortPrioOneTechs: [],
  hideDescription: false,
  searchSensitive: false,
  techFilter: null,
  showCheckedInEvents: false,
};

export default MktEventCards;

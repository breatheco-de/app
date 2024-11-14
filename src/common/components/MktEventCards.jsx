import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Flex, Box, useBreakpointValue } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import GridContainer from './GridContainer';
import useStyle from '../hooks/useStyle';
import Heading from './Heading';
import Icon from './Icon';
import axios from '../../axios';
import { sortToNearestTodayDate } from '../../utils';
import DraggableContainer from './DraggableContainer';
import DynamicContentCard from './DynamicContentCard';
import { WHITE_LABEL_ACADEMY, BREATHECODE_HOST } from '../../utils/variables';
import { parseQuerys } from '../../utils/url';

function MktEventCards({ isSmall, externalEvents, hideDescription, id, title, hoursToLimit, endpoint, type, ...rest }) {
  const [events, setEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); // Página actual del carrusel
  const router = useRouter();
  const { featuredLight, backgroundColor, fontColor } = useStyle();
  const lang = router.locale;
  const qsConnector = parseQuerys({
    featured: true,
    academy: WHITE_LABEL_ACADEMY,
  }, (endpoint && endpoint?.includes('?')));

  const hoursLimited = hoursToLimit * 60;
  const choosenEndpoint = endpoint || '/v1/events/all';
  const endpointDefault = `${choosenEndpoint}${qsConnector}`;
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

            const eventsFiltered = isMoreThanAnyEvents ? filteredByLang : existentLiveClasses;
            setEvents(eventsFiltered);
          }
        });
    }
  }, [externalEvents]);

  const itemsPerPage = useBreakpointValue({ base: 1, sm: 1, md: 2, lg: 3, xl: 4 });
  const totalPages = Math.ceil(events.length / itemsPerPage);

  const handlePageChange = (pageIndex) => {
    setCurrentPage(pageIndex);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPage((prevPage) => (prevPage + 1) % totalPages);
    }, 10000);

    return () => clearInterval(interval);
  }, [totalPages, currentPage]);

  return events?.length > 0 && (
    <>
      {type && type === 'carousel' ? (
        <>
          <Flex alignItems="center" width="100%" justifyContent="space-between" maxWidth="1280px" mx="auto" mb="20px">
            <Heading as="h2" fontWeight={700} fontSize="38px">
              {title}
            </Heading>
            <Icon icon="longArrowRight" width="58px" height="30px" color={fontColor} />
          </Flex>
          <Box maxWidth="1280px" mx="auto" overflow="hidden" paddingTop="10px">
            <Flex direction="column" alignItems="center">
              <Flex width="100%">
                <Flex
                  transform={`translateX(-${currentPage * (100 / itemsPerPage)}%)`}
                  transition="transform 0.5s ease"
                  width="100%"
                >
                  {events.map((event) => (
                    <Box
                      key={event.id}
                      flex={`0 0 ${100 / itemsPerPage}%`}
                      maxWidth={`${100 / itemsPerPage}%`}
                      padding="0 10px 0 0"
                      boxSizing="border-box"
                    >
                      <DynamicContentCard
                        type="workshop"
                        data={event}
                        height="100%"
                        width="100%"
                        background={backgroundColor}
                        borderColor={featuredLight}
                        maxHeight="256px"
                        userSelect="none"
                        transition="transform 0.15s ease-in-out"
                        _hover={{
                          transform: 'scale(1.03)',
                        }}
                      />
                    </Box>
                  ))}
                </Flex>
              </Flex>

              {/* Puntos de navegación */}
              <Flex mt={4} gap="15px">
                {Array.from({ length: totalPages }).map((_, pageIndex) => (
                  <Box
                    key={_}
                    width="1rem"
                    height="1rem"
                    borderRadius="full"
                    bg={pageIndex === currentPage ? 'blue.1000' : 'gray.300'}
                    cursor="pointer"
                    onClick={() => handlePageChange(pageIndex)}
                    _hover={{ bg: 'blue.600' }}
                  />
                ))}
              </Flex>
            </Flex>
          </Box>
        </>
      ) : (
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
          <Flex alignItems="center" gridGap="32px" marginBottom="26px">
            <Heading as="h2" fontWeight={700} fontSize="38px">
              {title}
            </Heading>
            <Icon icon="longArrowRight" width="58px" height="30px" />
          </Flex>
          <DraggableContainer className="hideOverflowX__" position="relative" width="100%" padding="7px 6px">
            <Flex gridGap="20px" width="max-content">
              {events.map((event) => (
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
  hideDescription: PropTypes.bool,
  type: PropTypes.string,
};

MktEventCards.defaultProps = {
  isSmall: false,
  id: 'UpcomingEvents',
  title: 'Starting soon',
  endpoint: '',
  hoursToLimit: 1440,
  externalEvents: null,
  hideDescription: false,
  type: undefined,
};

export default MktEventCards;

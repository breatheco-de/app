import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Flex } from '@chakra-ui/react';
import GridContainer from './GridContainer';
import Heading from './Heading';
import Icon from './Icon';
import axios from '../../axios';
import EventCard from './EventCard';
import { sortToNearestTodayDate } from '../../utils';

const MktEventCards = ({ id, title, endpoint, ...rest }) => {
  const [events, setEvents] = useState([]);

  const FourtyEightHours = 2880;
  const endpointDefault = endpoint || '/v1/events/all';

  useEffect(() => {
    axios.get(`${process.env.BREATHECODE_HOST}${endpointDefault}`)
      .then((res) => {
        const data = res?.data;
        if (data && data.length > 0) {
          const sortDateToLiveClass = sortToNearestTodayDate(data, FourtyEightHours);
          const existentLiveClasses = sortDateToLiveClass?.filter((l) => l?.starting_at && l?.ending_at);
          setEvents(existentLiveClasses);
        }
      });
  }, []);

  return events?.length > 0 && (
    <GridContainer
      id={id}
      maxWidth="1280px"
      withContainer
      px="10px"
      padding={{ base: '0 10px', lg: '0' }}
      flexDirection={{ base: 'column', lg: 'row' }}
      {...rest}
    >
      <Flex alignItems="center" gridGap="32px" marginBottom="32px">
        <Heading size="l" fontWeight={700}>
          {title}
        </Heading>
        <Icon icon="longArrowRight" width="58px" height="30px" />
      </Flex>
      <Box position="relative" className="hideOverflowX__" overflow="auto" width="100%">
        <Flex gridGap="20px" width="max-content" margin="0">
          {events.map((event) => (
            <EventCard
              key={event?.id}
              id={event?.id}
              title={event?.title}
              host={event?.host}
              description={event?.description}
              technologies={event?.technologies || []}
              startingAt={event?.starting_at}
              endingAt={event?.ending_at}
            />
          ))}
        </Flex>
      </Box>
    </GridContainer>
  );
};

MktEventCards.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  endpoint: PropTypes.string,
};

MktEventCards.defaultProps = {
  id: '',
  title: 'Starting soon',
  endpoint: '',
};

export default MktEventCards;

import PropTypes from 'prop-types';
import {
  Avatar,
  Box, Container, Text, useColorModeValue,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { AnimatedButton } from '../../common/components/Animated';
import Heading from '../../common/components/Heading';
import Icon from '../../common/components/Icon';
import useDistanceDate from '../../common/hooks/useDistanceDate';
import { devLog } from '../../utils';

function Events({ data, events }) {
  const featuredColors = useColorModeValue('featuredLight', 'featuredDark');
  const router = useRouter();

  const dateElapsed = (element) => useDistanceDate(
    element.starting_at,
    (element?.ended_at || element?.ending_at),
    router.locale,
  );

  const hasStartedText = (value) => {
    if (router.locale === 'en') return `Has started ${value}`;
    return `Comenzó hace ${value}`;
  };
  const startsText = (value) => {
    if (router.locale === 'en') return `Starts ${value}`;
    return `Iniciará ${value}`;
  };

  const filteredEvents = events && events?.filter((l) => useDistanceDate(
    l.starting_at,
    (l?.ended_at || l?.ending_at),
  ).isExpired === false).splice(0, 3);

  const handleOpenLink = (link) => {
    if (window !== undefined) {
      window.open(link, '_blank');
    }
  };

  return (
    <Container maxW="container.xl" height={{ base: '100%', md: '458px' }} display="flex" flexDirection={{ base: 'column', md: 'row' }} justifyContent="space-between" mt={{ base: '40px', md: '2rem' }} py="24px" px="0" alignItems="center" gridGap={51}>
      <Box display="flex" flexDirection="column" alignItems={{ base: 'center', md: 'start' }} gridGap="10px" flex={{ base: 1, md: 0.38 }} textAlign={{ base: 'center', md: 'left' }}>
        <Heading as="h2" size="14px" letterSpacing="0.05em" mb="8px" color="blue.default">
          {data.events.title}
        </Heading>
        <Text fontSize="26px" fontWeight="700" lineHeight="30px">
          {data.events.subTitle}
        </Text>
        <Text dangerouslySetInnerHTML={{ __html: data.events.description }} fontSize="14px" fontWeight="400" lineHeight="24px" mt="10px" letterSpacing="0.05em" color={useColorModeValue('gray.700', 'gray.300')} />
        <AnimatedButton onClick={() => window && window.open(data.events.button.link, '_ blank')} alignSelf={{ base: 'center', md: 'start' }}>
          {data.events.button.title}
        </AnimatedButton>
      </Box>

      <Box display="flex" position="relative" flexDirection="column" justifyContent="center" alignItems="center" gridGap="40px" flex={0.5} width={{ base: '100%', md: '592px' }} height="100%">
        <Box position="absolute" className="pulse-yellow" top="140px" left="0" background="yellow.default" p="14px" borderRadius="50px" filter={{ base: 'blur(4px)', md: 'blur(0px)' }}>
          <Icon icon="code" width="47px" height="47px" color="#fff" />
        </Box>
        <Box position="absolute" className="pulse-green" top="100px" left="120px" background="success" p="8px" borderRadius="50px" filter={{ base: 'blur(4px)', md: 'blur(0px)' }}>
          <Icon icon="community" width="17px" height="17px" color="#fff" />
        </Box>
        <Box position="absolute" className="pulse-green2" bottom="0px" left="90px" background="success" p="14px" borderRadius="50px" filter={{ base: 'blur(4px)', md: 'blur(0px)' }}>
          <Icon icon="community" width="47px" height="47px" color="#fff" />
        </Box>

        <Box position="absolute" className="pulse-green2" top="0px" right="90px" background="success" p="14px" borderRadius="50px" filter={{ base: 'blur(4px)', md: 'blur(0px)' }}>
          <Icon icon="community" width="47px" height="47px" color="#fff" />
        </Box>
        <Box position="absolute" className="pulse-green2" top="120px" right="40px" background="success" p="10px" borderRadius="50px" filter={{ base: 'blur(4px)', md: 'blur(0px)' }}>
          <Icon icon="community" width="27px" height="27px" color="#fff" />
        </Box>
        <Box position="absolute" className="pulse-yellow" top="160px" right="150px" background="yellow.default" p="6px" borderRadius="50px" filter={{ base: 'blur(4px)', md: 'blur(0px)' }}>
          <Icon icon="code" width="22px" height="22px" color="#fff" />
        </Box>
        <Box position="absolute" className="pulse-yellow" bottom="40px" right="80px" background="yellow.default" p="14px" borderRadius="50px" filter={{ base: 'blur(4px)', md: 'blur(0px)' }}>
          <Icon icon="code" width="47px" height="47px" color="#fff" />
        </Box>
        {/* <Box display="flex" p="10px" w="236px" alignItems="center" gridGap="8.5px" borderRadius="50px" background={featuredColors} border="2px solid" borderColor="blue.default" zIndex={5}>
          <Box className="pulse-red" background="#eb3422" p="8px" borderRadius="50px" alignSelf="center">
            <Icon icon="youtube" width="30px" color="#FFF" height="30px" />
          </Box>
          <Box display="flex" flexDirection="column">
            <Box fontSize="11px" letterSpacing="0.05em" fontWeight="900">
              {data?.events?.live?.title}
            </Box>
            <Box fontSize="10px" letterSpacing="0.05em" fontWeight="700">
              Started 40 mins ago
            </Box>
          </Box>
        </Box>

        <Box display="flex" className="pulse-blue" p="10px" w="190px" alignItems="center" gridGap="8.5px" borderRadius="50px" background={featuredColors} border="2px solid" borderColor="blue.default" zIndex={5}>
          <Box background="#FFB718" p="7px" borderRadius="50px" alignSelf="center">
            <Icon icon="code" width="30px" color="#fff" height="30px" />
          </Box>
          <Box display="flex" flexDirection="column">
            <Box fontSize="11px" letterSpacing="0.05em" fontWeight="900">
              {data?.events?.coding?.title}
            </Box>
            <Box fontSize="10px" letterSpacing="0.05em" fontWeight="700">
              Starts in 40 mins
            </Box>
          </Box>
        </Box> */}

        {filteredEvents && filteredEvents.map((l, i) => {
          devLog('Event:', { data: l, distanceTime: dateElapsed(l) });

          const { elapsedTime, startsIn30Minutes, hasStarted } = dateElapsed(l);
          const startingLiveColor = startsIn30Minutes && !hasStarted && 'pulse-green';
          const startedColor = hasStarted && 'pulse-blue';
          const widthSizes = {
            0: '320px',
            1: '280px',
            2: '280px',
          };

          return (
            <Box key={l?.title} display="flex" onClick={() => handleOpenLink(l?.url)} cursor="pointer" className={`${startingLiveColor} ${startedColor}`} p="10px 20px 10px 14px" w={widthSizes[i] || '220px'} alignItems="center" gridGap="8.5px" borderRadius="50px" background={featuredColors} border="2px solid" borderColor="blue.default" zIndex={5}>
              <Avatar
                width="30px"
                marginY="auto"
                marginRight="5px"
                height="30px"
                borderRadius="50px"
                alignSelf="center"
                src={l?.banner || ''}
              />
              {/* <Box background="#25BF6C" borderRadius="50px" alignSelf="center">
              </Box> */}
              <Box display="flex" flexDirection="column" gridGap="2px">
                <Box fontSize="14px" letterSpacing="0.05em" fontWeight="900" lineHeight="20px">
                  {l?.title}
                </Box>
                <Box fontSize="12px" letterSpacing="0.05em" fontWeight="700" lineHeight="18px">
                  {dateElapsed(l).hasStarted ? hasStartedText(elapsedTime) : startsText(elapsedTime)}
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Container>
  );
}

Events.propTypes = {
  data: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  events: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.any), PropTypes.any]),
};
Events.defaultProps = {
  events: null,
};

export default Events;

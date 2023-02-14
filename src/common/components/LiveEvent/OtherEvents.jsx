import {
  Box, Avatar,
} from '@chakra-ui/react';
import useStyle from '../../hooks/useStyle';
import useTruncatedText from '../../hooks/useTruncatedText';
import Icon from '../Icon';
import Link from '../NextChakraLink';
import Text from '../Text';

const OtherEvents = ({ events, isLiveOrStarting, textTime, featureReadMoreUrl }) => {
  const { hexColor, disabledColor, fontColor } = useStyle();

  return events.map((event) => {
    const startsAt = event?.starting_at && new Date(event.starting_at);
    const endsAt = event?.ending_at && new Date(event.ending_at);
    const [truncatedText, handleMouseOver, handleMouseOut] = useTruncatedText(event?.title, 42);

    return (
      <Box
        display="flex"
        padding="10px"
        borderBottom="1px solid"
        width="90%"
        margin="auto"
        borderColor="#DADADA"
      >
        <Box width="37px" height="37px" className={isLiveOrStarting(startsAt, endsAt) ? 'pulse-blue' : ''} borderRadius="full">
          {event?.icon_url ? (
            <Avatar src={event?.icon_url} name="icon url" width="37px" height="37px" />
          ) : (
            <Icon fill={event.fill || hexColor.greenLight} color={event.color} style={{ flexShrink: 0 }} width="37px" height="37px" icon={event.icon || 'group'} />
          )}
        </Box>
        <Box
          display="flex"
          justifyContent="center"
          flexDirection="column"
          marginLeft="10px"
        >
          <Link
            target="_blank"
            rel="noopener noreferrer"
            href={featureReadMoreUrl || event?.live_url || event?.live_stream_url || '#'}
            color={fontColor}
            fontSize="15px"
            lineHeight="18px"
            fontWeight="700"
            letterSpacing="0.05em"
            marginBottom="5px"
            marginTop="0"
            locale="en"
            fontFamily="Lato, Sans-serif"
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
            // onClick={(e) => {
            //   e?.preventDefault();

            //   bc.payment({ academy: event?.academy }).getEvent(event.id)
            //     .then(({ data }) => {
            //       if (data?.live_stream_url) {
            //         window.open(data?.live_stream_url);
            //       } else {
            //         toast({
            //           title: t('inactive-event'),
            //           status: 'info',
            //           duration: 5000,
            //           isClosable: true,
            //         });
            //       }
            //     })
            //     .catch(() => {
            //       toast({
            //         title: t('no-access'),
            //         status: 'error',
            //         duration: 5000,
            //         isClosable: true,
            //       });
            //     });
            // }}
          >
            {truncatedText}
          </Link>
          <Text
            fontSize="14px"
            lineHeight="18px"
            fontWeight={500}
            color={disabledColor}
            marginBottom="0"
            marginTop="0"
          >
            {startsAt ? textTime(startsAt, endsAt) : ''}
          </Text>
        </Box>
      </Box>
    );
  });
};

export default OtherEvents;

import {
  Box, Avatar, Tag, TagLabel,
} from '@chakra-ui/react';
import modifyEnv from '../../../../modifyEnv';
import { getStorageItem } from '../../../utils';
import useStyle from '../../hooks/useStyle';
import CustomTheme from '../../../../styles/theme';
import Icon from '../Icon';
import Link from '../NextChakraLink';
import Text from '../Text';

const OtherEvents = ({ events, isLiveOrStarting, textTime }) => {
  const { hexColor, disabledColor, fontColor } = useStyle();
  const accessToken = getStorageItem('accessToken');
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  const limit = 42;

  return events.map((event) => {
    const startsAt = event?.starting_at && new Date(event.starting_at);
    const endsAt = event?.ending_at && new Date(event.ending_at);
    const truncatedText = event?.title.length > limit ? `${event?.title?.substring(0, limit)}...` : event?.title;

    return (
      <Box
        padding="10px"
        borderBottom="1px solid"
        width="90%"
        margin="auto"
        borderColor="#DADADA"
      >
        <Box display="flex">
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
              href={`${BREATHECODE_HOST}/v1/events/me/event/${event?.id}/join?token=${accessToken}` || '#'}
              color={fontColor}
              fontSize="15px"
              lineHeight="18px"
              fontWeight="700"
              letterSpacing="0.05em"
              marginBottom="5px"
              marginTop="0"
              locale="en"
              fontFamily="Lato, Sans-serif"
              title={event?.title}
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
          </Box>
        </Box>
        <Box marginTop="10px" display="flex" justifyContent="space-between">
          {event.type && (
            <Tag
              size="sm"
              borderRadius="full"
              variant="solid"
              colorScheme="green"
              width="fit-content"
              background={CustomTheme.colors.green.light}
              flexShrink="0"
              height="20px"
              marginRight="5px"
            >
              <TagLabel
                fontWeight="700"
                color={CustomTheme.colors.success}
              >
                {event.type}
              </TagLabel>
            </Tag>
          )}
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

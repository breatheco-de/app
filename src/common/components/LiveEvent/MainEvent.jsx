import { Box, Divider, Tag, TagLabel, useToast } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import Text from '../Text';
import bc from '../../services/breathecode';
import Icon from '../Icon';
import useStyle from '../../hooks/useStyle';
import CustomTheme from '../../../../styles/theme';
import { getStorageItem } from '../../../utils';

const MainEvent = ({
  index, event, mainEvents, getOtherEvents, isLiveOrStarting, getLiveIcon, host, nearestEvent,
  isLive, stTranslation, mainClasses, textTime,
}) => {
  const { t, lang } = useTranslation('live-event');
  const limit = 42;
  const truncatedText = event?.title?.length > limit ? `${event?.title?.substring(0, limit)}...` : event?.title;

  const toast = useToast();
  const { fontColor, disabledColor, backgroundColor2, hexColor } = useStyle();

  const accessToken = getStorageItem('accessToken');
  const liveStartsAtDate = new Date(event.starting_at);
  const liveEndsAtDate = new Date(event.ending_at);

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        cursor={(!event.liveClassHash || isLiveOrStarting(liveStartsAtDate, liveEndsAtDate)) && 'pointer'}
        onClick={() => {
          if (event.liveClassHash && isLiveOrStarting(liveStartsAtDate, liveEndsAtDate)) {
            bc.events().joinLiveClass(event.liveClassHash)
              .then((resp) => {
                if (resp.data?.url) {
                  window.open(resp.data?.url);
                } else {
                  toast({
                    title: t('alert-message:no-link-exist'),
                    status: 'info',
                    duration: 4000,
                    isClosable: true,
                  });
                }
              })
              .catch(() => {
                toast({
                  title: t('alert-message:something-went-wrong'),
                  status: 'error',
                  duration: 3000,
                  isClosable: true,
                });
              });
          }
          if (!event.liveClassHash) {
            window.open(`${host}/v1/events/me/event/${nearestEvent?.id}/join?token=${accessToken}`);
          }
        }}
      >
        <Box
          borderRadius="full"
          width="50px"
          height="50px"
          className={
            isLiveOrStarting(liveStartsAtDate, liveEndsAtDate)
              ? `${mainClasses.length === 0 ? 'pulse-blue' : 'pulse-red'}`
              : ''
          }
          opacity={isLiveOrStarting(liveStartsAtDate, liveEndsAtDate) ? '1' : '0.5'}
          position="relative"
        >
          {mainEvents.length <= 1 && getOtherEvents().filter((e) => isLiveOrStarting(new Date(e?.starting_at), new Date(e?.ending_at)))?.length !== 0 && (
            <Box
              borderRadius="full"
              width="17px"
              height="17px"
              background="danger"
              position="absolute"
              color="white"
              display="flex"
              flexDirection="column"
              justifyContent="center"
              left="75%"
            >
              <Text linHeight="18px" textAlign="center" fontSize="14px" fontWeight="900">
                {getOtherEvents().filter((e) => isLiveOrStarting(new Date(e?.starting_at), new Date(e?.ending_at))).length}
              </Text>
            </Box>
          )}
          <Icon
            width="50px"
            height="50px"
            icon={getLiveIcon(event)}
          />
        </Box>
        <Box
          display="flex"
          justifyContent="center"
          flexDirection="column"
          marginLeft="10px"
          width="100%"
        >
          <Text
            size="15px"
            lineHeight="18px"
            fontWeight="900"
            color={fontColor}
            opacity={isLiveOrStarting(liveStartsAtDate, liveEndsAtDate) ? 1 : 0.5}
            marginBottom="5px"
            marginTop="0"
            title={event?.title}
          >
            {truncatedText ? (
              <>
                {truncatedText}
              </>
            ) : (
              <>
                {stTranslation ? stTranslation[lang]['live-event']['live-class'] : t('live-class')}
              </>
            )}
          </Text>
          <Box display="flex" justifyContent="space-between">
            {(event.subLabel || event.type) && (
              <Tag
                size="sm"
                borderRadius="full"
                variant="solid"
                colorScheme="green"
                width="fit-content"
                background={backgroundColor2}
              >
                <TagLabel
                  fontWeight="700"
                  color={hexColor.blueDefault}
                  opacity={isLiveOrStarting(liveStartsAtDate, liveEndsAtDate) ? 1 : 0.5}
                >
                  {event.subLabel || event.type}
                </TagLabel>
              </Tag>
            )}
            {isLive(liveStartsAtDate, liveEndsAtDate) ? (
              <Tag
                size="sm"
                borderRadius="full"
                variant="solid"
                colorScheme="green"
                width="fit-content"
                background={CustomTheme.colors.red.light}
              >
                <TagLabel
                  fontWeight="700"
                  color={CustomTheme.colors.danger}
                >
                  {stTranslation ? `• ${stTranslation[lang]['live-event']['live-now']}` : `• ${t('live-now')}`}
                </TagLabel>
              </Tag>
            ) : (
              <Text
                fontSize="13px"
                lineHeight="18px"
                fontWeight={500}
                color={disabledColor}
                marginBottom="0"
                marginTop="0"
              >
                {textTime(liveStartsAtDate, liveEndsAtDate)}
              </Text>
            )}
          </Box>
        </Box>
      </Box>
      {index !== mainEvents.length - 1 && <Divider margin="10px 0" />}
    </>
  );
};

MainEvent.propTypes = {
  index: PropTypes.number.isRequired,
  event: PropTypes.objectOf(PropTypes.any).isRequired,
  mainEvents: PropTypes.arrayOf(PropTypes.any).isRequired,
  getOtherEvents: PropTypes.func.isRequired,
  isLiveOrStarting: PropTypes.func.isRequired,
  getLiveIcon: PropTypes.func.isRequired,
  host: PropTypes.string.isRequired,
  nearestEvent: PropTypes.objectOf(PropTypes.any).isRequired,
  isLive: PropTypes.func.isRequired,
  textTime: PropTypes.func.isRequired,
  stTranslation: PropTypes.objectOf(PropTypes.any).isRequired,
  mainClasses: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default MainEvent;

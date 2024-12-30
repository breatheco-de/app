/* eslint-disable camelcase */
/* eslint-disable react/jsx-no-useless-fragment */
import { Box, Divider, Tag, TagLabel } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import Image from 'next/image';
import Text from '../Text';
import Icon from '../Icon';
import useStyle from '../../hooks/useStyle';
import CustomTheme from '../../../../styles/theme';
import { getStorageItem, lengthOfString } from '../../../utils';

function MainEvent({
  index, event, mainEvents, getOtherEvents, isLiveOrStarting, getLiveIcon, host, nearestEvent,
  isLive, mainClasses, currentDateText, subLabel, isWorkshop, limitOfText, cohorts,
}) {
  const { t, lang } = useTranslation('live-event');
  const limit = limitOfText || 40;
  const eventTitle = event?.cohort_name || event?.title;
  const titleLength = lengthOfString(eventTitle);
  const truncatedText = titleLength > limit ? `${eventTitle?.substring(0, limit)}...` : eventTitle;

  const truncatedTime = lengthOfString(currentDateText) >= 16 ? `${currentDateText?.substring(0, 15)}...` : currentDateText;
  const { fontColor, disabledColor, backgroundColor2, hexColor } = useStyle();

  const accessToken = getStorageItem('accessToken');
  const liveStartsAtDate = new Date(event?.starting_at);
  const liveEndsAtDate = new Date(event?.ended_at || event?.ending_at);

  const isTeacher = cohorts.some(({ slug, cohort_user }) => slug === event.cohort?.slug && ['TEACHER', 'ASSISTANT'].includes(cohort_user.role));
  const joinMessage = () => (isTeacher ? t('start-class') : event?.cohort?.name);

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        cursor={(!event?.hash || isLiveOrStarting(liveStartsAtDate, liveEndsAtDate)) && 'pointer'}
        onClick={() => {
          if (event?.hash && isLiveOrStarting(liveStartsAtDate, liveEndsAtDate)) {
            window.open(`${host}/v1/events/me/event/liveclass/join/${event?.hash}?token=${accessToken}`);
          }
          if (!event?.hash) {
            // window.open(`${host}/v1/events/me/event/${nearestEvent?.id}/join?token=${accessToken}`);
            window.open(`/${lang}/workshops/${nearestEvent?.slug}`);
          }
        }}
      >
        <Box
          borderRadius="full"
          width="50px"
          height="50px"
          minHeight="50px"
          maxHeight="50px"
          flexShrink={0}
          className={
            isLiveOrStarting(liveStartsAtDate, liveEndsAtDate)
              ? `${mainClasses.length === 0 ? 'pulse-blue' : 'pulse-red'}`
              : ''
          }
          opacity={isLiveOrStarting(liveStartsAtDate, liveEndsAtDate) ? '1' : '0.5'}
          position="relative"
        >
          {mainEvents.length <= 1 && getOtherEvents().filter((e) => isLiveOrStarting(new Date(e?.starting_at), new Date(e?.ended_at || e?.ending_at)))?.length !== 0 && (
            <Box
              borderRadius="full"
              width="17px"
              height="17px"
              position="absolute"
              color="white"
              display="flex"
              flexDirection="column"
              justifyContent="center"
              left="75%"
            >
              <Box borderRadius="full" background="none" className="pulse-red" width="16px" height="16px" display="inline-block" marginRight="5px">
                <Icon width="16px" height="16px" icon="on-live" />
              </Box>
            </Box>
          )}
          {event?.event_type?.icon_url ? (
            <Image src={event?.event_type?.icon_url} width={50} height={50} style={{ borderRadius: '50px' }} />
          ) : (
            <Icon
              width="50px"
              height="50px"
              icon={getLiveIcon(event)}
            />
          )}
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
            title={eventTitle}
          >
            {(truncatedText && eventTitle) ? (
              <>
                {truncatedText}
              </>
            ) : (
              <>
                {joinMessage()}
              </>
            )}
          </Text>
          <Box display="flex" justifyContent="space-between">
            {(event?.subLabel || event?.type || subLabel) && (
              <Tag
                size="sm"
                borderRadius="full"
                variant="solid"
                colorScheme="green"
                width="fit-content"
                background={isWorkshop ? 'green.light' : backgroundColor2}
              >
                <TagLabel
                  fontWeight="700"
                  color={isWorkshop ? 'success' : hexColor.blueDefault}
                  opacity={isLiveOrStarting(liveStartsAtDate, liveEndsAtDate) ? 1 : 0.5}
                >
                  {event?.subLabel || event?.type || subLabel}
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
                  {`• ${t('live-now')}`}
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
                title={currentDateText}
              >
                {truncatedTime}
              </Text>
            )}
          </Box>
        </Box>
      </Box>
      {index !== mainEvents.length - 1 && <Divider margin="10px 0" />}
    </>
  );
}

MainEvent.propTypes = {
  index: PropTypes.number.isRequired,
  event: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  mainEvents: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  getOtherEvents: PropTypes.func.isRequired,
  isLiveOrStarting: PropTypes.func.isRequired,
  getLiveIcon: PropTypes.func.isRequired,
  host: PropTypes.string.isRequired,
  nearestEvent: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  isLive: PropTypes.func.isRequired,
  currentDateText: PropTypes.string,
  mainClasses: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  subLabel: PropTypes.string,
  isWorkshop: PropTypes.bool,
  limitOfText: PropTypes.number,
  cohorts: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
};
MainEvent.defaultProps = {
  subLabel: '',
  currentDateText: '',
  isWorkshop: false,
  limitOfText: 40,
  cohorts: [],
};

export default MainEvent;

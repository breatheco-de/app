/* eslint-disable camelcase */
/* eslint-disable react/jsx-no-useless-fragment */
import { Box, Divider, Tag, TagLabel, HStack, VStack, useTheme } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import Image from 'next/image';
import Text from '../Text';
import Icon from '../Icon';
import useStyle from '../../hooks/useStyle';
import CustomTheme from '../../../styles/theme';
import { getStorageItem, lengthOfString } from '../../utils';

function MainEvent({
  layoutVariant,
  allowedDivider,
  index, event, mainEvents, getOtherEvents, isLiveOrStarting, getLiveIcon, host, nearestEvent,
  isLive, mainClasses, currentDateText, subLabel, isWorkshop, limitOfText, cohorts,
}) {
  const { t, lang } = useTranslation('live-event');
  const theme = useTheme();
  const limit = limitOfText || 40;
  const eventTitle = event?.cohort_name || event?.title;
  const titleLength = lengthOfString(eventTitle);
  const truncatedText = titleLength > limit ? `${eventTitle?.substring(0, limit)}...` : eventTitle;

  const truncatedTime = lengthOfString(currentDateText) >= 16 ? `${currentDateText?.substring(0, 15)}...` : currentDateText;
  const { fontColor, disabledColor, backgroundColor2, hexColor } = useStyle();

  const accessToken = getStorageItem('accessToken');
  const liveStartsAtDate = new Date(event?.starting_at);
  const liveEndsAtDate = new Date(event?.ended_at || event?.ending_at);
  const isCurrentEventLive = isLive(liveStartsAtDate, liveEndsAtDate);

  const isTeacher = cohorts.some(({ slug, cohort_user }) => slug === event.cohort?.slug && ['TEACHER', 'ASSISTANT'].includes(cohort_user.role));
  const joinMessage = () => (isTeacher ? t('start-class') : event?.cohort?.name);

  const isClickable = (!event?.hash || isLiveOrStarting(liveStartsAtDate, liveEndsAtDate));
  const handleClick = () => {
    if (event?.hash && isLiveOrStarting(liveStartsAtDate, liveEndsAtDate)) {
      window.open(`${host}/v1/events/me/event/liveclass/join/${event?.hash}?token=${accessToken}`);
    }
    if (!event?.hash) {
      window.open(`/${lang}/workshops/${nearestEvent?.slug}`);
    }
  };

  const renderIcon = () => (
    <Box
      borderRadius="full"
      width={layoutVariant === 'inline' ? '28px' : '40px'}
      height={layoutVariant === 'inline' ? '28px' : '40px'}
      minWidth={layoutVariant === 'inline' ? '28px' : '40px'}
      minHeight={layoutVariant === 'inline' ? '28px' : '40px'}
      maxHeight={layoutVariant === 'inline' ? '28px' : '40px'}
      flexShrink={0}
      className={
        isLiveOrStarting(liveStartsAtDate, liveEndsAtDate)
          ? `${mainClasses.length === 0 ? 'pulse-blue' : 'pulse-red'}`
          : ''
      }
      position="relative"
    >
      {mainEvents.length <= 1 && getOtherEvents.filter((e) => isLiveOrStarting(new Date(e?.starting_at), new Date(e?.ended_at || e?.ending_at)))?.length !== 0 && (
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
          <Box borderRadius="full" background="none" className="pulse-red" width="16px" height="16px" display="inline-block">
            <Icon width="16px" height="16px" icon="on-live" />
          </Box>
        </Box>
      )}
      {event?.event_type?.icon_url ? (
        <Image src={event?.event_type?.icon_url} width={40} height={40} style={{ borderRadius: '50px' }} alt={event?.title || 'Event icon'} />
      ) : (
        <Icon width="40px" height="40px" icon={getLiveIcon(event)} />
      )}
    </Box>
  );

  const renderBadge = (variant, isLiveNow) => {
    if (!(event?.subLabel || event?.type || subLabel)) {
      return <Box />;
    }

    let tagBg;
    let tagColor;

    if (variant === 'inline' && isLiveNow) {
      tagBg = 'white';
      tagColor = hexColor.blueDefault;
    } else if (variant === 'inline' && isWorkshop) {
      tagBg = 'blue.50';
      tagColor = 'black';
    } else if (isWorkshop) {
      tagBg = 'green.light';
      tagColor = 'success';
    } else {
      tagBg = backgroundColor2;
      tagColor = hexColor.blueDefault;
    }

    return (
      <Tag
        fontSize={variant === 'inline' ? '12px' : '13px'}
        borderRadius="full"
        variant="solid"
        width="fit-content"
        background={tagBg}
        color={tagColor}
      >
        <TagLabel fontWeight="700">
          {event?.subLabel || event?.type || subLabel}
        </TagLabel>
      </Tag>
    );
  };

  const renderStatusTime = (variant, isLiveNow) => {
    if (isLiveNow) {
      if (variant === 'inline') {
        return (
          <Text fontSize="12px" lineHeight="1.2" fontWeight="700" color={CustomTheme.colors.danger}>
            {`• ${t('live-now')}`}
          </Text>
        );
      }
      return (
        <Tag
          size="sm"
          borderRadius="full"
          variant="solid"
          width="fit-content"
          background={CustomTheme.colors.red.light}
          color={CustomTheme.colors.danger}
        >
          <TagLabel fontWeight="700">{`• ${t('live-now')}`}</TagLabel>
        </Tag>
      );
    }

    const upcomingColor = variant === 'inline' ? theme.colors.gray[500] : disabledColor;
    return (
      <Text
        fontSize={variant === 'inline' ? '12px' : '13px'}
        lineHeight="1.2"
        fontWeight={500}
        color={upcomingColor}
        title={currentDateText}
        whiteSpace="nowrap"
      >
        {truncatedTime}
      </Text>
    );
  };

  const renderTitle = (variant) => {
    let titleColor = fontColor;
    if (variant === 'inline') {
      if (isLiveOrStarting(liveStartsAtDate, liveEndsAtDate)) {
        titleColor = hexColor.blueDefault;
      } else {
        titleColor = fontColor;
      }
    }

    return (
      <Text
        fontSize={variant === 'inline' ? '12px' : '15px'}
        lineHeight="1.2"
        fontWeight={variant === 'inline' ? '500' : '900'}
        color={titleColor}
        title={eventTitle}
        noOfLines={2}
        wordBreak="break-word"
      >
        {(truncatedText && eventTitle) ? truncatedText : joinMessage()}
      </Text>
    );
  };

  return (
    <>
      {layoutVariant === 'inline' && (
        <VStack
          spacing={3}
          align="stretch"
          cursor={isClickable ? 'pointer' : 'default'}
          onClick={isClickable ? handleClick : undefined}
          width="100%"
        >
          <HStack spacing={2} align="center">
            {renderIcon()}
            {renderTitle(layoutVariant)}
          </HStack>
          <HStack justifyContent="space-between" width="100%">
            {renderBadge(layoutVariant, isCurrentEventLive)}
            {renderStatusTime(layoutVariant, isCurrentEventLive)}
          </HStack>
        </VStack>
      )}

      {layoutVariant === 'stacked' && (
        <HStack
          spacing={3}
          align="center"
          cursor={isClickable ? 'pointer' : 'default'}
          onClick={isClickable ? handleClick : undefined}
          width="100%"
        >
          {renderIcon()}
          <VStack spacing={1} align="stretch" width="100%">
            {renderTitle(layoutVariant)}
            <HStack justifyContent="space-between" width="100%">
              {renderBadge(layoutVariant, isCurrentEventLive)}
              {renderStatusTime(layoutVariant, isCurrentEventLive)}
            </HStack>
          </VStack>
        </HStack>
      )}

      {index !== mainEvents.length - 1 && allowedDivider && <Divider margin="10px 0" />}
    </>
  );
}

MainEvent.propTypes = {
  layoutVariant: PropTypes.oneOf(['stacked', 'inline']),
  allowedDivider: PropTypes.bool,
  index: PropTypes.number.isRequired,
  event: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  mainEvents: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  getOtherEvents: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
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
  layoutVariant: 'stacked',
  allowedDivider: true,
  subLabel: '',
  currentDateText: '',
  isWorkshop: false,
  limitOfText: 40,
  cohorts: [],
};

export default MainEvent;

import { useColorModeValue, Box, Button } from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import PropTypes from 'prop-types';
import Image from 'next/image';
import CustomTheme from '../../../styles/theme';
import Link from '../NextChakraLink';
import Text from '../Text';
import Icon from '../Icon';
import OtherEvents from './OtherEvents';
import MainEvent from './MainEvent';
import useLiveEvent from './useLiveEvent';

function LiveEvent({
  mainClasses,
  otherEvents,
  startingSoonDelta,
  featureLabel,
  featureReadMoreUrl,
  cohorts,
  ...rest
}) {
  const {
    t,
    isOpen,
    setIsOpen,
    eventTimeTexts,
    mainEvents,
    getOtherEventsResult,
    isLiveOrStarting,
    isLive,
    getLiveIcon,
    textTime,
    existsWhiteLabel,
    BREATHECODE_HOST,
    logoData,
    nearestEvent,
  } = useLiveEvent({ mainClasses, otherEvents, startingSoonDelta });

  const bgColor2 = useColorModeValue('featuredLight', 'featuredDark');
  const textColor = useColorModeValue('black', 'white');
  const textGrayColor = useColorModeValue('gray.600', 'gray.350');

  return (
    <Box>
      <Box
        background="yellow.light"
        padding="6px 8px"
        color="black"
        textAlign="center"
        borderRadius="17px"
        mb="10px"
        fontWeight={700}
      >
        {t('choose-program:sidebar.live-events-title')}
      </Box>

      <Box
        padding="10px"
        maxWidth="100%"
        {...rest}
      >
        {(featureLabel || featureReadMoreUrl) && (
          <Text
            fontSize="sm"
            lineHeight="19px"
            fontWeight="700"
            color={textColor}
            textAlign="center"
            marginBottom="15px"
            marginTop="0"
          >
            {featureLabel}
            {' '}
            {featureReadMoreUrl && (
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href={featureReadMoreUrl}
                color={useColorModeValue('blue.default', 'blue.300')}
                display="inline-block"
                letterSpacing="0.05em"
                locale="en"
                fontFamily="Lato, Sans-serif"
              >
                {t('learn-more')}
              </Link>
            )}
          </Text>
        )}
        {mainEvents.length > 0 ? (
          <Box
            background={bgColor2}
            border={mainEvents.some((event) => isLiveOrStarting(new Date(event?.starting_at), new Date((event?.ended_at || event?.ending_at)))) ? '2px solid' : 'none'} // Updated condition check
            borderColor={CustomTheme.colors.blue.default}
            padding="10px"
            borderRadius="19px"
            width="100%"
            margin="auto"
          >
            {mainEvents.map((event, index) => (
              <MainEvent
                key={event.id}
                currentDateText={eventTimeTexts?.[event.id]}
                index={index}
                event={event}
                mainEvents={mainEvents}
                getOtherEvents={getOtherEventsResult}
                isLiveOrStarting={isLiveOrStarting}
                getLiveIcon={getLiveIcon}
                host={BREATHECODE_HOST}
                nearestEvent={nearestEvent}
                isLive={isLive}
                textTime={textTime}
                isWorkshop={!event?.hash}
                subLabel={event?.hash ? t('master-class') : t('workshop')}
                mainClasses={mainClasses}
                limitOfText={54}
                cohorts={cohorts}
              />
            ))}
          </Box>
        ) : (
          <Box
            display="flex"
            alignItems="center"
            background={bgColor2}
            borderColor=""
            padding="10px"
            borderRadius="19px"
            width="100%"
            margin="auto"
          >
            <Box
              borderRadius="full"
              background="featuredLigth"
              opacity="0.5"
              padding="10px"
            >
              {existsWhiteLabel ? (
                <Image
                  src={logoData?.logo_url || '/static/images/4geeks.png'}
                  width={40}
                  height={40}
                  style={{
                    maxHeight: '40px',
                    minHeight: '40px',
                    objectFit: 'contain',
                  }}
                  alt={logoData?.name ? `${logoData.name} logo` : '4Geeks logo'}
                />
              ) : (
                <Icon
                  width="34px"
                  height="34px"
                  icon="logoModern"
                  color="currentColor"
                />
              )}
            </Box>
            <Box
              display="flex"
              justifyContent="center"
              flexDirection="column"
              marginLeft="10px"
            >
              <Text
                fontSize="md"
                lineHeight="18px"
                fontWeight="900"
                color={textColor}
                marginBottom="5px"
                marginTop="0"
              >
                {t('live-class')}
              </Text>
              <Text
                fontSize="12px"
                lineHeight="18px"
                fontWeight="700"
                color={textGrayColor}
                margin="0"
              >
                {t('no-live-class')}
              </Text>
            </Box>
          </Box>
        )}
        {isOpen && (
          <Box marginTop="10px" maxHeight="450px" overflow="auto">
            <OtherEvents
              events={getOtherEventsResult}
              dateTextObj={eventTimeTexts}
              isLiveOrStarting={isLiveOrStarting}
              isLive={isLive}
              subLabel={t('workshop')}
              textTime={textTime}
            />
          </Box>
        )}
        {getOtherEventsResult?.length > 0 && getOtherEventsResult !== null && (
          <Button
            variant="ghost"
            height="auto"
            margin="auto"
            padding="5px"
            marginTop="5px"
            display="flex"
            alignItems="center"
            fontWeight="500"
            border="none"
            background="none"
            cursor="pointer"
            onClick={() => {
              setIsOpen(!isOpen);
            }}
          >
            {getOtherEventsResult.filter((e) => isLiveOrStarting(new Date(e?.starting_at), new Date((e?.ended_at || e?.ending_at))))?.length !== 0 ? (
              <>
                <Box borderRadius="full" background="none" className="pulse-red" width="16px" height="16px" display="inline-block" marginRight="5px">
                  <Icon width="16px" height="16px" icon="on-live" />
                </Box>
                {t('other-live-events-now')}
              </>
            ) : t('upcoming')}
            {isOpen ? (<ChevronUpIcon w={6} h={7} />) : (<ChevronDownIcon w={6} h={7} />)}
          </Button>
        )}
      </Box>
    </Box>
  );
}

LiveEvent.propTypes = {
  mainClasses: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  otherEvents: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  startingSoonDelta: PropTypes.number,
  featureLabel: PropTypes.string,
  featureReadMoreUrl: PropTypes.string,
  cohorts: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
};

LiveEvent.defaultProps = {
  mainClasses: [],
  otherEvents: [],
  startingSoonDelta: 30,
  featureLabel: null,
  featureReadMoreUrl: null,
  cohorts: [],
};

export default LiveEvent;

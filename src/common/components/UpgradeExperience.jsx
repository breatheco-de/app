import { Button, Popover, PopoverTrigger, PopoverContent, Box, Img, PopoverArrow } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useState } from 'react';
// import { formatDuration, intervalToDuration } from 'date-fns';
// import { es, en } from 'date-fns/locale';
// import { useRouter } from 'next/router';
import NextChakraLink from './NextChakraLink';
import Icon from './Icon';
// import { isDateMoreThanAnyDaysAgo } from '../../utils';

// const availableLanguages = {
//  es,
//  en,
//};

function UpgradeExperience({ storySettings, data }) {
  const [isOpen, setIsOpen] = useState(storySettings?.open || false);
  // const router = useRouter();
  // const locale = storySettings?.locale || router?.locale;

  const iconBg = {
    0: 'blue.default',
    1: 'yellow.default',
    2: 'green.400',
  };
  return (
    <Popover
      id="Language-Hover"
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      placement="bottom-end"
      trigger="click"
    >
      <PopoverTrigger>
        <Button
          variant="default"
          fontSize="13px"
          onClick={() => setIsOpen(!isOpen)}
          padding="0 0 0 1rem"
          display="flex"
          gridGap="0.5rem"
          // style={{ padding: '0 0 0 0' }}
        >
          Upgrade Experience
          <Box padding="10px" background={isOpen && 'blue.600'} borderRightRadius="3px" display="flex" alignItems="center" height="100%">
            <Icon icon="arrowDownFilled" width="16px" height="9px" color="#fff" />
          </Box>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        // bg={popoverContentBgColor}
        rounded="md"
        width={{ base: '100%', md: 'auto' }}
        minW="210px"
      >
        <PopoverArrow />
        <Box
          width="100%"
          display="flex"
          boxShadow="2xl"
          flexDirection="column"
          gridGap="20px"
          padding="12px"
          minWidth="300px"
        >
          {data?.length > 0 && data.map((item, index) => {
            // const timestamp = item.ending_at ? new Date(item.ending_at) : '';
            // const isTrial = item.status === 'trial';
            const title = item?.course_translation?.title;
            // const hasExpired = timestamp - new Date() <= 0;
            // const isMoreThanOneDay = isDateMoreThanAnyDaysAgo(timestamp, 1);
            // const formatTimeString = (start) => {
            //  const duration = intervalToDuration({
            //    end: new Date(),
            //    start,
            //  });

            //  const formated = formatDuration(duration,
            //    {
            //      format: isMoreThanOneDay ? ['days'] : ['days', 'hours', 'minutes'],
            //      delimiter: ', ',
            //      locale: availableLanguages[locale],
            //    });
            //  if (hasExpired && locale === 'es') {
            //    return `Hace ${formated}`;
            //  }
            //  if (hasExpired && locale === 'en') {
            //    return `${formated} ag//o`;
            //  }

            //  if (!hasExpired && locale === 'es') {
            //    return `Quedan ${formated}`;
            //  }
            //  return `${formated} left`;
            //};
            // const endingDate = formatTimeString(timestamp);

            return (
              <Box key={item.slug} display="flex" alignItems="center" gridGap="10px">
                <Box
                  background={!item?.icon_url && (iconBg[index] || iconBg[0])}
                  padding={!item?.icon_url && '8px 7px'}
                  borderRadius="50%"
                >
                  {item?.icon_url ? (
                    <Img src={item?.icon_url} width="28px" height="28px" alt="icon" />
                  ) : (
                    <Icon icon="coding" width="20px" height="20px" color="#ffffff" />
                  )}
                </Box>
                <NextChakraLink
                  width="auto"
                  href={`/${item.slug}`}
                  role="group"
                  alignSelf="center"
                  display="flex"
                  gridGap="5px"
                  fontWeight="bold"
                  textDecoration="none"
                >
                  {title}
                </NextChakraLink>
                {/* {isTrial && (
                  <Box background="red.light2" padding="3px 10px" minWidth="max-content" fontSize="12px" width="fit-content" borderRadius="15px">
                    {endingDate}
                  </Box>
                )} */}
                {/* {item.status === 'paid' && (
                  <Icon icon="crown" width="20px" height="15px" />
                )}
                {item.status === 'finished' && (
                  <Icon icon="checkboxChecked" width="20px" height="20px" />
                )} */}
              </Box>
            );
          })}
        </Box>
      </PopoverContent>
    </Popover>
  );
}

UpgradeExperience.propTypes = {
  data: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  storySettings: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};
UpgradeExperience.defaultProps = {
  data: [],
  storySettings: {},
};

export default UpgradeExperience;

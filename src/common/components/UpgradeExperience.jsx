import { Button, Popover, PopoverTrigger, PopoverContent, Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'next/router';
import NextChakraLink from './NextChakraLink';
import Icon from './Icon';

const UpgradeExperience = ({ storySettings, data }) => {
  // const { colorMode, toggleColorMode } = useColorMode();
  const [isOpen, setIsOpen] = useState(storySettings?.open || false);
  const router = useRouter();
  const locale = storySettings?.locale || router?.locale;
  // console.log('data:::', data);
  console.log('storySettings:::', storySettings);

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
      placement="bottom-start"
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
        {/* <PopoverArrow /> */}
        <Box
          width="100%"
          display="flex"
          boxShadow="2xl"
          flexDirection="column"
          gridGap="20px"
          padding="12px"
        >
          {data.length > 0 && data.map((item, index) => {
            const timestamp = item.ending_at ? new Date(item.ending_at) : '';
            const isTrial = item.status === 'trial';

            const endingDate = {
              en: `${formatDistanceToNowStrict(
                timestamp,
                'dd',
              )} left`,
              es: `${formatDistanceToNowStrict(
                timestamp,
                { locale: es },
                'dd',
              )} restantes`,
            };

            return (
              <Box key={item.label} display="flex" alignItems="center" gridGap="10px">
                <Box background={iconBg[index] || iconBg[0]} padding="8px 7px" borderRadius="50%">
                  <Icon icon={item.icon} width="20px" height="20px" color="#ffffff" />
                </Box>
                <NextChakraLink
                  width="auto"
                  key={item.label}
                  href={item.src}
                  role="group"
                  alignSelf="center"
                  display="flex"
                  gridGap="5px"
                  fontWeight="bold"
                  textDecoration="none"
                >
                  {item.label}
                </NextChakraLink>
                {isTrial && (
                  <Box background="red.light2" padding="3px 10px" minWidth="max-content" fontSize="12px" width="fit-content" borderRadius="15px">
                    {endingDate[locale]}
                  </Box>
                )}
                {item.status === 'paid' && (
                  <Icon icon="crown" width="20px" height="15px" />
                )}
                {item.status === 'finished' && (
                  <Icon icon="checkboxChecked" width="20px" height="20px" />
                )}
              </Box>
            );
          })}
        </Box>
      </PopoverContent>
    </Popover>
  );
};

UpgradeExperience.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  storySettings: PropTypes.objectOf(PropTypes.any),
};
UpgradeExperience.defaultProps = {
  data: [],
  storySettings: {},
};

export default UpgradeExperience;

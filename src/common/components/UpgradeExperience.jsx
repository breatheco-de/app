import { Button, Popover, PopoverTrigger, PopoverContent, Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useState } from 'react';
import NextChakraLink from './NextChakraLink';
import Icon from './Icon';

const UpgradeExperience = ({ data }) => {
  // const { colorMode, toggleColorMode } = useColorMode();
  const [isOpen, setIsOpen] = useState(false);
  console.log('data:::', data);

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
          gridGap="10px"
          padding="12px"
        >
          {data.length > 0 && data.map((item) => {
            console.log('test');

            return (
              <NextChakraLink
                width="100%"
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
            );
          })}
        </Box>
      </PopoverContent>
    </Popover>
  );
};

UpgradeExperience.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
};
UpgradeExperience.defaultProps = {
  data: [],
};

export default UpgradeExperience;

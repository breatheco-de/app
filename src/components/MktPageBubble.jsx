import React from 'react';
import PropTypes from 'prop-types';
import { Box, Flex, Text, useColorModeValue, Avatar, useBreakpointValue } from '@chakra-ui/react';
import Icon from './Icon';
import PageBubble from './PageBubble';

function MktPageBubble({
  url,
  supportAvatars,
  topText,
  bottomText,
  iconString,
}) {
  const showFullBubble = useBreakpointValue({ base: false, md: true });
  return (
    <PageBubble
      url={url}
      background={showFullBubble ? useColorModeValue('white', 'gray.700') : useColorModeValue('green.400', 'green.600')}
      borderRadius={showFullBubble ? '30px' : '50%'}
      boxShadow={showFullBubble ? useColorModeValue('lg', 'dark-lg') : '0 2px 8px rgba(0,0,0,0.10)'}
      p={showFullBubble ? 3 : 1.5}
      display="flex"
      alignItems="center"
      justifyContent={showFullBubble ? 'space-between' : 'center'}
      width={showFullBubble ? 'fit-content' : '52px'}
      height={showFullBubble ? '60px' : '52px'}
      bottom="10px"
    >
      {showFullBubble ? (
        <>
          <Flex alignItems="center">
            {supportAvatars?.length > 0 && supportAvatars.map((avatarUrl, index) => (
              <Flex key={avatarUrl} position="relative" left="-10px">
                <Avatar
                  size="sm"
                  src={avatarUrl}
                  ml={index > 0 ? '-10px' : '10px'}
                  zIndex={supportAvatars.length - index}
                />
              </Flex>
            ))}

            <Box>
              <Text fontWeight="bold" fontSize="xs" color={useColorModeValue('gray.800', 'whiteAlpha.900')}>
                {topText}
              </Text>
              <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                {bottomText}
              </Text>
            </Box>
          </Flex>
          <Box
            bg={useColorModeValue('green.400', 'green.600')}
            borderRadius="50%"
            p={2}
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow={useColorModeValue('lg', 'dark-lg')}
            ml={3}
            mr={-2}
          >
            <Icon icon={iconString} color="#ffffff" width="35px" height="35px" />
          </Box>
        </>
      ) : (
        <Icon icon={iconString} color="#ffffff" width="35px" height="35px" />
      )}
    </PageBubble>
  );
}

MktPageBubble.propTypes = {
  url: PropTypes.string.isRequired,
  supportAvatars: PropTypes.arrayOf(PropTypes.string),
  topText: PropTypes.string,
  bottomText: PropTypes.string,
  iconString: PropTypes.string,
};

MktPageBubble.defaultProps = {
  supportAvatars: [],
  topText: '',
  bottomText: '',
  iconString: 'whatsapp-border',
};

export default MktPageBubble;

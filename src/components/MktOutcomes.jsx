import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Flex,
  VStack,
  Image,
  Link as ChakraLink,
  Divider,
} from '@chakra-ui/react';
import useStyle from '../hooks/useStyle';
import Text from './Text';

function StatItem({ value, description, linkLabel, linkUrl }) {
  const { fontColor } = useStyle();
  return (
    <VStack align="start" spacing="10px" w="100%">
      <Text fontSize={{ base: '34px', md: '44px' }} fontWeight="800" color="blue.default">
        {value}
      </Text>
      <Text size={{ base: 'sm', md: 'md' }} color={fontColor}>
        {description}
        {linkLabel && linkUrl && (
        <>
          {' '}
          <ChakraLink href={linkUrl} color="blue.default" isExternal>
            {linkLabel}
          </ChakraLink>
        </>
        )}
      </Text>
      <Divider borderColor="gray.200" />
    </VStack>
  );
}

StatItem.propTypes = {
  value: PropTypes.string,
  description: PropTypes.string,
  linkLabel: PropTypes.string,
  linkUrl: PropTypes.string,
};

StatItem.defaultProps = {
  value: '',
  description: '',
  linkLabel: '',
  linkUrl: '',
};

function MktOutcomes({ slice }) {
  const { fontColor3, navbarBackground } = useStyle();
  const items = Array.isArray(slice?.items) ? slice.items : [];
  const left = items.filter((it) => (it?.side || 'left') === 'left');
  const right = items.filter((it) => (it?.side || 'left') === 'right');

  const centerLogo = slice?.primary?.center_logo?.url || '';
  const centerColor = slice?.primary?.center_color || '';
  const avatarTop = slice?.primary?.avatar_top?.url || '';
  const avatarTopLabel = slice?.primary?.avatar_top_label || '';
  const avatarBl = slice?.primary?.avatar_bottom_left?.url || '';
  const avatarBlLabel = slice?.primary?.avatar_bottom_left_label || '';
  const avatarBr = slice?.primary?.avatar_bottom_right?.url || '';
  const avatarBrLabel = slice?.primary?.avatar_bottom_right_label || '';

  return (
    <Box w="100%" py={{ base: '28px', md: '40px' }} mt={{ base: '28px', md: '40px' }}>
      <Flex
        maxW="1200px"
        mx="auto"
        px={{ base: '16px', md: '24px' }}
        gap={{ base: '28px', md: '64px' }}
      >
        <VStack align="start" spacing={{ base: '28px', md: '40px' }} flex="1">
          {left.map((it) => (
            <StatItem
              value={it?.value || ''}
              description={it?.description || ''}
              linkLabel={it?.link_label || ''}
              linkUrl={it?.link_url?.url || ''}
            />
          ))}
        </VStack>

        <Box position="relative" w={{ sm: '200px', md: '300px' }} display={{ base: 'none', sm: 'block' }} flexShrink={0} alignSelf="center">
          <Box
            position="absolute"
            inset="0"
            m="auto"
            w={{ sm: '80px', md: '150px' }}
            h={{ sm: '80px', md: '150px' }}
            borderRadius="full"
            border="2px solid"
            borderColor={centerColor || 'gray.200'}
            display="flex"
            alignItems="center"
            justifyContent="center"
            opacity={centerColor ? 0.8 : 1}
            bg="white"
          >
            {centerLogo && (
            <Image src={centerLogo} alt="center" w="70%" objectFit="contain" margin="auto" />
            )}
          </Box>

          {avatarTop && (
            <VStack position="absolute" top={{ sm: '-150px', md: '-218px' }} left="50%" transform="translateX(-60%)" spacing="6px">
              {avatarTopLabel && (
              <Text size="xs" align="center" color={fontColor3} backgroundColor={navbarBackground} borderRadius="full" padding="4px 8px">{avatarTopLabel}</Text>
              )}
              <Image src={avatarTop} alt={avatarTopLabel} w={{ sm: '50px', md: '100px' }} borderRadius="full" objectFit="cover" />
            </VStack>
          )}
          {avatarBl && (
            <VStack position="absolute" bottom={{ sm: '-90px', md: '-147px' }} left="-32px" spacing="6px">
              <Image src={avatarBl} alt={avatarBlLabel} w={{ sm: '50px', md: '100px' }} borderRadius="full" objectFit="cover" />
              {avatarBlLabel && (
              <Text size="xs" color={fontColor3} backgroundColor={navbarBackground} borderRadius="full" padding="4px 8px">{avatarBlLabel}</Text>
              )}
            </VStack>
          )}
          {avatarBr && (
            <VStack position="absolute" bottom={{ sm: '-75px', md: '-150px' }} right="-8px" spacing="6px">
              <Image src={avatarBr} alt={avatarBrLabel} w={{ sm: '50px', md: '100px' }} borderRadius="full" objectFit="cover" />
              {avatarBrLabel && (
              <Text size="xs" color={fontColor3} backgroundColor={navbarBackground} borderRadius="full" padding="4px 8px">{avatarBrLabel}</Text>
              )}
            </VStack>
          )}
        </Box>

        <VStack align="start" mt={{ base: '20px', md: '120px' }} spacing={{ base: '28px', md: '40px' }} flex="1">
          {right.map((it) => (
            <StatItem
              value={it?.value || ''}
              description={it?.description || ''}
              linkLabel={it?.link_label || ''}
              linkUrl={it?.link_url?.url || ''}
            />
          ))}
        </VStack>
      </Flex>
    </Box>
  );
}

MktOutcomes.propTypes = {
  slice: PropTypes.shape({
    primary: PropTypes.shape({
      center_logo: PropTypes.shape({ url: PropTypes.string }),
      avatar_top: PropTypes.shape({ url: PropTypes.string }),
      avatar_top_label: PropTypes.string,
      avatar_bottom_left: PropTypes.shape({ url: PropTypes.string }),
      avatar_bottom_left_label: PropTypes.string,
      avatar_bottom_right: PropTypes.shape({ url: PropTypes.string }),
      avatar_bottom_right_label: PropTypes.string,
      center_color: PropTypes.string,
    }),
    items: PropTypes.arrayOf(PropTypes.shape({
      side: PropTypes.string,
      value: PropTypes.string,
      description: PropTypes.string,
      link_label: PropTypes.string,
      link_url: PropTypes.shape({ url: PropTypes.string }),
    })),
  }).isRequired,
};

export default MktOutcomes;

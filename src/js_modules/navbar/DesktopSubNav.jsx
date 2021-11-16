import {
  Box, Flex, Text, Stack, Link, useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import Icon from '../../common/components/Icon';

const DesktopSubNav = ({ label, href, subLabel }) => {
  const linkColor = useColorModeValue('gray.600', 'gray.300');
  const router = useRouter();
  const getColorLink = (link) => {
    if (router?.pathname === link || router.asPath === link) {
      return 'blue.default';
    }
    return linkColor;
  };
  return (
    <Link
      href={href}
      role="group"
      display="block"
      p={2}
      style={{ borderRadius: '5px' }}
      _hover={{ bg: useColorModeValue('featuredLight', 'gray.900') }}
    >
      <Stack direction="row" align="center">
        <Box>
          <Text
            transition="all .3s ease"
            color={getColorLink(href)}
            _groupHover={{ color: useColorModeValue('gray.900', 'featuredLight') }}
            fontWeight={500}
          >
            {label}
          </Text>
          {/* optional short description */}
          <Text fontSize="sm">{subLabel}</Text>
        </Box>
        <Flex
          transition="all .3s ease"
          transform="translateX(-10px)"
          opacity={0}
          _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
          justify="flex-end"
          align="center"
          flex={1}
        >
          <Icon
            icon="arrowRight"
            color={useColorModeValue('#A4A4A4', '#EEF9FE')}
            width="15px"
            height="15px"
          />
        </Flex>
      </Stack>
    </Link>
  );
};

DesktopSubNav.propTypes = {
  label: PropTypes.string.isRequired,
  href: PropTypes.string,
  subLabel: PropTypes.string,
};

DesktopSubNav.defaultProps = {
  href: '/',
  subLabel: '',
};

export default DesktopSubNav;

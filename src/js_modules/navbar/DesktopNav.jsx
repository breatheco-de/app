import {
  Box,
  Flex,
  Text,
  Stack,
  Popover,
  Link,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import Icon from '../../common/components/Icon';

import DesktopSubNav from './DesktopSubNav';

const DesktopNav = ({ NAV_ITEMS }) => {
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('blue.default', 'blue.default');
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');
  const router = useRouter();
  const getColorLink = (link) => {
    if (router?.pathname === link) {
      return 'blue.default';
    }
    return linkColor;
  };

  const getColorIcon = (link) => {
    if (router?.pathname === link) {
      return '#0097CD';
    }
    return 'gray';
  };

  return (
    <Stack direction="row" spacing={4} alignItems="center">
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover id={navItem.href ?? 'trigger-64'} trigger="hover" placement="bottom-start">
            <PopoverTrigger>
              <Link
                display="flex"
                alignItems="center"
                p={2}
                href={navItem.href ?? '#'}
                fontSize="sm"
                textTransform="uppercase"
                fontWeight={700}
                color={getColorLink(navItem.href || navItem.asPath)}
                // color={linkColor}
                _hover={{
                  textDecoration: 'none',
                  color: linkHoverColor,
                }}
              >
                {navItem.label}
                {navItem.subMenu && (
                  <Icon
                    icon="arrowDown"
                    color={getColorIcon(navItem.href || navItem.asPath)}
                    width="22px"
                    height="22px"
                  />
                )}
              </Link>
            </PopoverTrigger>

            {navItem.subMenu && (
              <PopoverContent
                border={0}
                boxShadow="xl"
                bg={popoverContentBgColor}
                p={4}
                rounded="md"
                minW="md"
              >
                <Stack>
                  <Flex
                    flexDirection="row"
                    padding="20px 0"
                    borderBottom={1}
                    borderStyle="solid"
                    borderColor={useColorModeValue('gray.200', 'gray.900')}
                    alignItems="center"
                    color={linkColor}
                  >
                    <Box width="140px">
                      <Icon icon={navItem.icon} width="50px" height="50px" />
                    </Box>
                    <Box display="flex" flexDirection="column">
                      <Text size="xl" fontWeight={900}>
                        {navItem.label}
                      </Text>
                      <Text fontWeight={500}>{navItem.description}</Text>
                    </Box>
                  </Flex>
                  {navItem.subMenu.map((child) => {
                    const { label, subLabel, href } = child;
                    return (
                      <DesktopSubNav
                        key={`${label}-${subLabel}`}
                        label={label}
                        subLabel={subLabel}
                        href={href}
                      />
                    );
                  })}
                  u
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

DesktopNav.propTypes = {
  NAV_ITEMS: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      description: PropTypes.string,
      icon: PropTypes.string,
      href: PropTypes.string,
      asPath: PropTypes.string,
      subMenu: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string,
          subLabel: PropTypes.string,
          href: PropTypes.string,
        }),
      ),
    }),
  ),
};

DesktopNav.defaultProps = {
  NAV_ITEMS: [
    {
      href: '/',
      description: '',
      icon: 'book',
      asPath: '/',
    },
  ],
};

export default DesktopNav;

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
import { isAbsoluteUrl } from '../../utils/url';

const DesktopItem = ({ item }) => {
  const router = useRouter();
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('blue.default', 'blue.default');

  const getColorLink = (link) => {
    if (router?.pathname === link || router.asPath === link || router?.pathname.includes(link)) {
      return 'blue.default';
    }
    return linkColor;
  };

  const getColorIcon = (link) => {
    if (router?.pathname === link || router?.asPath === link || router?.pathname.includes(link)) {
      return '#0097CD';
    }
    return 'gray';
  };

  return (
    <Box key={item.label}>
      <Popover id={item.href ?? 'trigger-64'} trigger="hover" placement="bottom-start">
        <PopoverTrigger>
          <Link
            display="flex"
            alignItems="center"
            p={2}
            href={item.href ?? '#'}
            target={isAbsoluteUrl(item.href) ? '_blank' : undefined}
            rel={isAbsoluteUrl(item.href) ? 'noopener noreferrer' : undefined}
            fontSize="sm"
            textTransform="uppercase"
            fontWeight={700}
            color={getColorLink(item.href || item.asPath)}
            // color={linkColor}
            _hover={{
              textDecoration: 'none',
              color: linkHoverColor,
            }}
          >
            {item.label}
            {item.subMenu && (
              <Icon
                icon="arrowDown"
                color={getColorIcon(item.href || item.asPath)}
                width="22px"
                height="22px"
              />
            )}
          </Link>
        </PopoverTrigger>

        {item.subMenu && (
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
                  <Icon icon={item.icon} width="50px" height="50px" />
                </Box>
                <Box display="flex" flexDirection="column">
                  <Text size="xl" fontWeight={900}>
                    {item.label}
                  </Text>
                  <Text fontWeight={500}>{item.description}</Text>
                </Box>
              </Flex>
              {item.subMenu.map((child) => {
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
  );
};

DesktopItem.propTypes = {
  item: PropTypes.shape({
    label: PropTypes.string.isRequired,
    href: PropTypes.string,
    asPath: PropTypes.string,
    icon: PropTypes.string,
    description: PropTypes.string,
    subMenu: PropTypes.arrayOf(PropTypes.any),
  }).isRequired,
};

export default DesktopItem;

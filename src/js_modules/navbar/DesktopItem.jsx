import {
  Box,
  Flex,
  Text,
  Stack,
  Popover,
  PopoverArrow,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import Icon from '../../common/components/Icon';
import DesktopSubNav from './DesktopSubNav';
import { isAbsoluteUrl } from '../../utils/url';
import NextChakraLink from '../../common/components/NextChakraLink';

const DesktopItem = ({ item }) => {
  const router = useRouter();
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');
  const linkColor = useColorModeValue('gray.600', 'gray.200');

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
          {/* Box is important for popover content trigger */}
          <Box>
            <NextChakraLink
              display="flex"
              width="max-content"
              alignItems="center"
              p={2}
              href={item.href ?? '#'}
              // locale={router.locale}
              target={isAbsoluteUrl(item.href) ? '_blank' : undefined}
              rel={isAbsoluteUrl(item.href) ? 'noopener noreferrer' : undefined}
              fontSize="sm"
              textTransform="uppercase"
              fontWeight={700}
              color={getColorLink(item.href || item.asPath)}
              // color={linkColor}
              _hover={{
                textDecoration: 'none',
                color: 'blue.default',
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
            </NextChakraLink>
          </Box>
        </PopoverTrigger>

        {item.subMenu && (
          <PopoverContent
            bg={popoverContentBgColor}
            rounded="md"
            minW="md"
          >
            <PopoverArrow />
            <Stack
              border={0}
              boxShadow="2xl"
              p={4}
              rounded="md"
              minW="md"
            >
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

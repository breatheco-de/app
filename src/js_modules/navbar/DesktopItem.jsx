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
  TabList,
  Tab,
  TabPanel,
  TabPanels,
  Tabs,
  Button,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Icon from '../../common/components/Icon';
import { isAbsoluteUrl } from '../../utils/url';
import NextChakraLink from '../../common/components/NextChakraLink';
import CustomText from '../../common/components/Text';

const DesktopItem = ({ item }) => {
  const router = useRouter();
  const [popoverOpen, setPopoverOpen] = useState(false);
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
      <Popover
        id={item.href ?? 'trigger-64'}
        isOpen={popoverOpen}
        onClose={() => setPopoverOpen(false)}
        trigger="click"
        placement="bottom-start"
      >
        <PopoverTrigger>
          {/* Box is important for popover content trigger */}
          {item.subMenu ? (
            <Button
              variant="unstyled"
              display="flex"
              flexDirection="row"
              textTransform="uppercase"
              fontWeight={700}
              color="gray.600"
              fontSize="0.875rem"
              _hover={{
                textDecoration: 'none',
                color: 'blue.default',
              }}
              onClick={() => setPopoverOpen(!popoverOpen)}
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
            </Button>
          ) : (
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
          )}
        </PopoverTrigger>

        {item.subMenu && (
          <PopoverContent
            bg={popoverContentBgColor}
            rounded="md"
            width="100%"
            // minW="lg"
            maxW="38rem"
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
                padding="0 0 20px 0"
                borderBottom={1}
                borderStyle="solid"
                borderColor={useColorModeValue('gray.200', 'gray.900')}
                alignItems="center"
                color={linkColor}
                mb="10px"
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
              <Tabs
                defaultIndex={0}
                display="flex"
                flexDirection={{ base: 'column', md: 'row' }}
                gridGap="8px"
                variant="unstyled"
              >
                <TabList display="flex" gridGap="12px" flexDirection={{ base: 'row', md: 'column' }} width={{ base: '100%', md: 'auto' }}>
                  {
                    item.subMenu.map((child) => {
                      const {
                        label, subLabel, href,
                      } = child;
                      return (
                        <Tab
                          _selected={{ borderLeft: '4px solid', borderColor: 'blue.default', opacity: 1 }}
                          // my="2px"
                          opacity={0.7}
                          _hover={{ borderLeft: '4px solid', borderColor: 'blue.default', opacity: 1 }}
                          borderRadius="2px"
                          style={{
                            transition: 'all 0.15s ease-in-out',
                          }}
                          // p={2}
                          textAlign="left"
                        >

                          <Text
                            // width="100%"
                            minWidth="110px"
                            transition="all .3s ease"
                            color={getColorLink(href)}
                            _groupHover={{ color: useColorModeValue('gray.900', 'featuredLight') }}
                            fontWeight={500}
                          >
                            {label}
                          </Text>
                          {/* optional short description */}
                          <Text fontSize="sm">{subLabel}</Text>
                        </Tab>
                      );
                    })
                  }
                </TabList>
                <TabPanels>
                  {item.subMenu.map((child) => {
                    const {
                      description, subMenu,
                    } = child;

                    return (
                      <TabPanel padding={0}>
                        {description && (
                          <CustomText fontSize="14px" pb="15px">
                            {description}
                          </CustomText>
                        )}
                        {subMenu.length > 0 && subMenu.map((l) => (
                          <NextChakraLink
                            href={l.href}
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
                                  color={getColorLink(l.href)}
                                  _groupHover={{ color: useColorModeValue('gray.900', 'featuredLight') }}
                                  fontWeight={500}
                                >
                                  {l.label}
                                </Text>
                              </Box>
                              <Flex
                                transition="all .3s ease"
                                transform="translateX(-10px)"
                                opacity={0}
                                _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
                                justify="flex-start"
                                // justify="flex-end"
                                align="center"
                                flex={1}
                              >
                                <Icon
                                  icon="arrowRight"
                                  color="#0097CD"
                                  width="12px"
                                  height="12px"
                                />
                              </Flex>
                            </Stack>
                          </NextChakraLink>
                        ))}
                      </TabPanel>
                    );
                  })}
                </TabPanels>
              </Tabs>
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

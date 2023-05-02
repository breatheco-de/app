import {
  Box,
  Flex,
  Text,
  Stack,
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
import styled from 'styled-components';
import Icon from '../../common/components/Icon';
import { isAbsoluteUrl } from '../../utils/url';
import NextChakraLink from '../../common/components/NextChakraLink';
import CustomText from '../../common/components/Text';
import Image from '../../common/components/Image';

const DesktopItem = ({ item }) => {
  const router = useRouter();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');
  const popoverBorderColor = useColorModeValue('gray.250', 'gray.dark');
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

  const StyledBox = styled(Box)`
    .custom-popover {
      display: none;
      top:50px;
    }

    :hover .custom-popover {
      display: block;
    }

  `;

  const Triangle = styled(Box)`
    display: none;
  `;

  return (
    <StyledBox
      key={item.label}
      position="relative"
      className="styled-box"
      css={{
        '&:hover': {
          '.custom-popover': {
            display: 'block',
          },
          '.triangle': {
            display: 'block',
          },
        },
      }}
    >
      {item.subMenu ? (
        <>
          <Button
            variant="unstyled"
            display="flex"
            flexDirection="row"
            textTransform="uppercase"
            fontWeight={700}
            color={linkColor}
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
                color="currentColor"
                width="22px"
                height="22px"
              />
            )}
          </Button>
          <Box
            bg={popoverContentBgColor}
            rounded="md"
            // minW="lg"
            maxW="40rem"
            position="absolute"
            className="custom-popover"
            display="none"
            zIndex="100"
            border="1px solid"
            borderColor={popoverBorderColor}
            width="640px"
          >
            <div style={{ width: '100%', position: 'absolute', top: '-10px' }}>
              <Triangle
                className="triangle"
                background={popoverContentBgColor}
                borderTop="1px solid"
                borderLeft="1px solid"
                borderColor={popoverBorderColor}
                zIndex="101"
                width="20px"
                height="20px"
                transform="rotate(45deg)"
                left="50%"
                marginLeft="30px"
              />
            </div>
            <Stack
              border={0}
              boxShadow="2xl"
              p={4}
              rounded="md"
              minW="md"
            >
              <Flex
                flexDirection="row"
                padding="0 0 16px 0"
                borderBottom={useColorModeValue(1, 2)}
                borderStyle="solid"
                borderColor={useColorModeValue('gray.200', 'gray.700')}
                alignItems="center"
                color={linkColor}
                mb="10px"
                gridGap="20px"
              >
                <Box width="auto" ml="4px">
                  <Icon icon={item.icon} width="50px" height="50px" />
                </Box>
                <Box display="flex" flexDirection="column" mr={{ base: '10px', md: '20px' }}>
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
                // gridGap="8px"
                variant="unstyled"
              >
                <TabList display="flex" gridGap="12px" flexDirection={{ base: 'row', md: 'column' }} width={{ base: '100%', md: 'auto' }}>
                  {
                    item.subMenu.map((child) => {
                      const {
                        icon, label, subLabel, href,
                      } = child;

                      const isUrl = icon && isAbsoluteUrl(icon);

                      return (
                        <Tab
                          key={`${label}-${href}`}
                          borderLeft="4px solid transparent"
                          _selected={{ borderLeft: '4px solid', borderColor: 'blue.default', opacity: 1 }}
                          // my="2px"
                          opacity={0.7}
                          _hover={{ borderLeft: '4px solid', borderColor: 'blue.default', opacity: 1 }}
                          borderRadius="2px"
                          justifyContent="flex-start"
                          style={{
                            // transition: 'all 0.15s ease-in-out',
                            padding: '0.5rem 0.8rem',
                          }}
                          gridGap="14px"
                          // p={2}
                          textAlign="left"
                        >
                          {icon && (isUrl ? (
                            <Image src={icon} width={33} height={33} alt={label} style={{ minWidth: '33px', minHeight: '33px' }} />
                          ) : <Icon icon={icon} width="33px" height="30px" color={useColorModeValue('#1A202C', '#ffffff')} />)}
                          <Text
                            // width="100%"
                            minWidth="130px"
                            // transition="all .3s ease"
                            color={getColorLink(href)}
                            _groupHover={{ color: useColorModeValue('gray.900', 'featuredLight') }}
                            fontWeight={500}
                          >
                            {label}
                          </Text>
                          {/* optional short description */}
                          {subLabel && <Text fontSize="sm">{subLabel}</Text>}
                        </Tab>
                      );
                    })
                  }
                </TabList>
                <Box width="3px" background={useColorModeValue('gray.300', 'gray.700')} margin="0 15px" />
                <TabPanels>
                  {item.subMenu.map((child) => {
                    const {
                      description, subMenu,
                    } = child;

                    return (
                      <TabPanel key={description} padding={0}>
                        {description && (
                          <CustomText fontSize="14px" pb="15px">
                            {description}
                          </CustomText>
                        )}
                        {subMenu.length > 0 && subMenu.map((l) => (
                          <NextChakraLink
                            href={l.href}
                            key={l.href}
                            // role="group"
                            display="block"
                            p={2}
                            style={{ borderRadius: '5px' }}
                            _hover={{ bg: useColorModeValue('featuredLight', 'gray.900') }}
                          >
                            <Stack direction="row" align="center">
                              <Box>
                                <Text
                                  // transition="all .3s ease"
                                  color={getColorLink(l.href)}
                                  _groupHover={{ color: useColorModeValue('gray.900', 'featuredLight') }}
                                  fontWeight={500}
                                >
                                  {l.label}
                                </Text>
                              </Box>
                              <Flex
                                // transition="all .3s ease"
                                opacity={1}
                                justify="flex-start"
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
          </Box>
        </>
      ) : (
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
      )}
    </StyledBox>
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

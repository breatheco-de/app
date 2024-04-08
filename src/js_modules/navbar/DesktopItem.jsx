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
import { memo } from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import Icon from '../../common/components/Icon';
import { isAbsoluteUrl } from '../../utils/url';
import NextChakraLink from '../../common/components/NextChakraLink';
import CustomText from '../../common/components/Text';
import useStyle from '../../common/hooks/useStyle';
import { ArrowDown, ArrowRight } from '../../common/components/Icon/components';
import { getStorageItem } from '../../utils';

const StyledBox = styled(Box)`
.custom-popover {
  display: none;
  top: 70px;
}
`;

const Triangle = styled(Box)``;

function DesktopItem({ item, readSyllabus }) {
  const router = useRouter();
  const { borderColor, hexColor } = useStyle();
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');
  const popoverBorderColor = useColorModeValue('gray.250', 'gray.dark');
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const groupHoverColor = useColorModeValue('gray.900', 'featuredLight');
  const backgroundHoverLink = useColorModeValue('featuredLight', 'gray.900');
  const borderSize = useColorModeValue(1, 2);
  const backgroundOfLine = useColorModeValue('gray.300', 'gray.700');
  const prismicRef = process.env.PRISMIC_REF;
  const prismicApi = process.env.PRISMIC_API;

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

  // manage subMenus in level 2
  const existsSubMenu = item?.subMenu?.length > 0;
  const withPopover = item?.with_popover?.active;
  const existsItemWithPopover = existsSubMenu || withPopover || item.description;

  const itemSubMenu = existsSubMenu ? item.subMenu.map((l) => {
    const isLessons = l.slug === 'lessons';
    if (isLessons) {
      return ({
        ...l,
        subMenu: [...readSyllabus, ...l.subMenuContent],
      });
    }
    return l;
  }) : [];

  const token = getStorageItem('accessToken');

  if (item?.id === 'courses' && !prismicRef && !prismicApi) {
    return null;
  }

  return (
    <StyledBox
      key={item.label}
      position="relative"
      className="styled-box"
      role="group"
      _groupHover={{ display: 'block' }}
    >
      {existsItemWithPopover ? (
        <>
          <Button
            variant="unstyled"
            display="flex"
            flexDirection="row"
            style={{
              textWrap: 'balance',
            }}
            height="65px"
            textTransform="uppercase"
            fontWeight={700}
            color={linkColor}
            fontSize="0.875rem"
            _hover={{
              textDecoration: 'none',
              color: 'blue.default',
            }}
          >
            {item.label}
            {existsItemWithPopover && (
              <span>
                <ArrowDown
                  color="currentColor"
                  width="22px"
                  height="22px"
                />
              </span>
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
            width={{ base: 'auto', lg: '500px', xl: '640px' }}
            role="group"
            _groupHover={{ display: 'block' }}
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
                padding={existsSubMenu && '0 0 16px 0'}
                borderBottom={existsSubMenu ? borderSize : '0px'}
                borderStyle="solid"
                borderColor={existsSubMenu ? borderColor : 'transparent'}
                alignItems="center"
                color={linkColor}
                mb={withPopover ? '0px' : '10px'}
                gridGap="20px"
              >
                <Box width="auto" ml="4px" flexShrink={0}>
                  {item?.image ? (
                    <Image src={item?.image} width={135} height={77.4} style={{ objectFit: 'cover' }} />
                  ) : (
                    <Icon icon={item?.icon} width="50px" height="50px" color={hexColor.blueDefault} />
                  )}
                </Box>
                <Box display="flex" flexDirection="column" mr={{ base: '10px', md: '20px' }}>
                  <Text size="xl" fontWeight={900}>
                    {item.label}
                  </Text>
                  <Text fontWeight={500}>{item.description}</Text>
                  {withPopover && (
                    <NextChakraLink
                      //href={item?.with_popover.link}
                      //href={`${item.with_popover.link}?token=${token}`}
                      href={`${item.with_popover.link}?token=${token}`}
                      key={item?.with_popover.link}
                      display="block"
                      p="0.8rem 0"
                      width="max-content"
                      style={{ borderRadius: '5px' }}
                    >
                      {item?.with_popover?.title}
                      <span>
                        <ArrowRight width="12px" height="12px" color="#0097CD" style={{ display: 'inline', marginLeft: '8px' }} />
                      </span>
                    </NextChakraLink>
                  )}
                </Box>
              </Flex>
              {existsSubMenu && (
                <>
                  <Tabs
                    defaultIndex={0}
                    display="flex"
                    flexDirection={{ base: 'column', md: 'row' }}
                    // gridGap="8px"
                    variant="unstyled"
                  >
                    <TabList display="flex" gridGap="12px" flexDirection={{ base: 'row', md: 'column' }} width={{ base: '100%', md: 'auto' }}>
                      {
                        existsSubMenu && itemSubMenu.map((child) => {
                          const {
                            icon, label, subLabel, href,
                          } = child;

                          const isUrl = icon && isAbsoluteUrl(icon);

                          return !child?.href && (
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
                              ) : <Icon icon={icon} width="33px" height="30px" color={hexColor.blueDefault} />)}
                              <Text
                                // width="100%"
                                minWidth="130px"
                                // transition="all .3s ease"
                                color={getColorLink(href)}
                                _groupHover={{ color: groupHoverColor }}
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
                    <Box width="3px" background={backgroundOfLine} margin="0 15px" />
                    <TabPanels>
                      {existsSubMenu && itemSubMenu.map((child) => {
                        const {
                          description, subMenu = [],
                        } = child;

                        return !child?.href && (
                          <TabPanel key={description} padding={0}>
                            {description && (
                              <CustomText fontSize="14px" pb="15px">
                                {description}
                              </CustomText>
                            )}
                            {subMenu?.length > 0 && subMenu.map((l) => (
                              <NextChakraLink
                                href={l.href}
                                key={l.href}
                                // role="group"
                                display="block"
                                p={2}
                                style={{ borderRadius: '5px' }}
                                _hover={{ bg: backgroundHoverLink }}
                              >
                                <Stack direction="row" align="center">
                                  <Box>
                                    <Text
                                      // transition="all .3s ease"
                                      color={getColorLink(l.href)}
                                      _groupHover={{ color: groupHoverColor }}
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
                                    <ArrowRight
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
                  {existsSubMenu && itemSubMenu.map((child) => child?.href && (
                    <Box>
                      <NextChakraLink
                        href={child.href}
                        key={child.href}
                        display="block"
                        p={2}
                        style={{ borderRadius: '5px' }}
                        _hover={{ bg: backgroundHoverLink }}
                      >
                        <Stack direction="row" align="center">
                          <Box>
                            <Text
                              // transition="all .3s ease"
                              color={getColorLink(child.href)}
                              _groupHover={{ color: groupHoverColor }}
                              fontWeight={500}
                            >
                              {child.label}
                            </Text>
                          </Box>
                          <Flex
                            // transition="all .3s ease"
                            opacity={1}
                            justify="flex-start"
                            align="center"
                            flex={1}
                          >
                            <ArrowRight
                              color={hexColor.blueDefault}
                              width="12px"
                              height="12px"
                            />
                          </Flex>
                        </Stack>
                      </NextChakraLink>
                    </Box>
                  ))}
                </>
              )}
            </Stack>
          </Box>
        </>
      ) : (
        <NextChakraLink
          display="flex"
          width="auto"
          textAlign="center"
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
            <span>
              <ArrowDown
                color={getColorIcon(item.href || item.asPath)}
                width="22px"
                height="22px"
              />
            </span>
          )}
        </NextChakraLink>
      )}
    </StyledBox>
  );
}

DesktopItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string,
    label: PropTypes.string.isRequired,
    href: PropTypes.string,
    asPath: PropTypes.string,
    icon: PropTypes.string,
    image: PropTypes.string,
    description: PropTypes.string,
    subMenu: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
    slug: PropTypes.string,
    with_popover: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  }),
  readSyllabus: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
};
DesktopItem.defaultProps = {
  item: {},
};

export default memo(DesktopItem);

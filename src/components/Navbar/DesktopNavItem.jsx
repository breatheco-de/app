import {
  Box,
  Flex,
  Text,
  useColorModeValue,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Portal,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { memo } from 'react';
import Icon from '../Icon';
import { isAbsoluteUrl, parseQuerys } from '../../utils/url';
import NextChakraLink from '../NextChakraLink';
import useStyle from '../../hooks/useStyle';
import { ArrowDown } from '../Icon/components';
import { getColorVariations } from '../../utils';

// Helper function to generate the navigation URL
const generateNavItemUrl = (item, parentId = null) => {
  const baseHref = item.asPath || item.href || '#';
  let queryParams = {};

  if (parentId && item.label) {
    queryParams = { internal_cta_placement: `navbar-${parentId}-${item.label.toLowerCase().replace(/ /g, '-')}` };
  } else if (item.id && !parentId) {
    queryParams = { internal_cta_placement: `navbar-${item.id}` };
  }

  if (Object.keys(queryParams).length > 0) {
    return `${baseHref}${parseQuerys(queryParams, baseHref.includes('?'))}`;
  }

  return baseHref;
};

function DesktopNavItem({ item }) {
  const { hexColor, lightColor, fontColor, backgroundColor, fontColor2 } = useStyle();
  const popoverBorderColor = useColorModeValue('gray.250', 'gray.dark');
  const BgColorVariations = item?.bgColor ? getColorVariations(item?.bgColor) : {};
  const textColorVariations = item?.titleColor ? getColorVariations(item?.titleColor) : {};

  const itemBackgroundColor = useColorModeValue(BgColorVariations?.light?.mode1, BgColorVariations?.dark?.mode5);
  const itemTextColor = useColorModeValue(textColorVariations?.light?.mode1, textColorVariations?.dark?.mode1);

  const hasMainMenu = Array.isArray(item.mainMenu) && item.mainMenu.length > 0;

  if (item.id === 'read' && !item.mainMenu && item.subMenu) {
    return null;
  }

  return (
    <Box
      key={item.label}
      position="relative"
    >
      {hasMainMenu ? (
        <Popover
          trigger="hover"
          placement="bottom-start"
          offset={[-50, 24]}
          matchWidth={false}
        >
          {({ isOpen }) => (
            <>
              <PopoverTrigger>
                <Button
                  variant="unstyled"
                  display="flex"
                  flexDirection="row"
                  fontWeight={400}
                  color={isOpen ? 'blue.default' : lightColor}
                  fontSize="14px"
                  _hover={{
                    color: 'blue.default',
                    textDecoration: 'none',
                  }}
                >
                  {item.label}
                  {hasMainMenu && (
                    <span>
                      <ArrowDown
                        color="currentColor"
                        width="22px"
                        height="22px"
                      />
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <Portal>
                <PopoverContent
                  zIndex={100}
                  mx="2"
                  bg={hexColor.lightGreyBackground}
                  rounded="md"
                  border="1px solid"
                  borderColor={popoverBorderColor}
                  boxShadow="lg"
                  p="8px"
                  width={{ base: 'auto', lg: 'auto', xl: 'auto' }}
                >
                  <PopoverBody p={0}>
                    <Flex direction="row" gap="8px" flex="1">
                      <Box maxWidth="300px" p="8px" backgroundColor={itemBackgroundColor}>
                        <Flex direction="column" gap={2}>
                          <Text fontWeight="bold" fontSize="18px" color={itemTextColor} display="flex" alignItems="center" gap="8px">
                            {item.icon && <Icon icon={item.icon} color={itemTextColor} width="24px" height="24px" mb={2} />}
                            {item.label}
                          </Text>
                          <Text fontSize="14px" color={fontColor} mb={4}>
                            {item.description}
                          </Text>
                        </Flex>
                      </Box>
                      <Flex
                        flex="1"
                        direction="row"
                        gap="8px"
                      >
                        {item.mainMenu.map((mainMenuItem) => (
                          <Flex
                            key={mainMenuItem.id || mainMenuItem.label}
                            direction="column"
                            flex="1"
                            gap="8px"
                            width="300px"
                            minHeight="250px"
                            backgroundColor={backgroundColor}
                            p="8px"
                          >
                            <Flex direction="column">
                              {mainMenuItem.label && (
                                <Text fontWeight="bold" color={itemTextColor} fontSize="12px" mb={1}>
                                  {mainMenuItem.label}
                                </Text>
                              )}
                              {mainMenuItem.description && (
                                <Text fontSize="12px" color={lightColor} mb={2}>
                                  {mainMenuItem.description}
                                </Text>
                              )}
                            </Flex>
                            {Array.isArray(mainMenuItem.subMenu) && mainMenuItem.subMenu.map((subMenuItem) => (
                              subMenuItem.type === 'header' ? (
                                <Text
                                  key={subMenuItem.label}
                                  color="#A9A9A9"
                                  fontSize="14px"
                                  mt={4}
                                  mb={1}
                                >
                                  {subMenuItem.label}
                                </Text>
                              ) : (
                                <NextChakraLink
                                  key={subMenuItem.href || subMenuItem.label}
                                  href={generateNavItemUrl(subMenuItem, mainMenuItem.id)}
                                  display="block"
                                  py={1}
                                  px={2}
                                  ml={-2}
                                  borderRadius="md"
                                  target={!subMenuItem.asPath && isAbsoluteUrl(subMenuItem.href) ? '_blank' : undefined}
                                  rel={!subMenuItem.asPath && isAbsoluteUrl(subMenuItem.href) ? 'noopener noreferrer' : undefined}
                                  _hover={{ color: itemTextColor }}
                                  color={fontColor2}
                                  fontSize="sm"
                                >
                                  <Flex align="center" justify="space-between">
                                    {subMenuItem.label}
                                  </Flex>
                                </NextChakraLink>
                              )
                            ))}
                          </Flex>
                        ))}
                      </Flex>
                    </Flex>
                  </PopoverBody>
                </PopoverContent>
              </Portal>
            </>
          )}
        </Popover>
      ) : (
        <NextChakraLink
          display="flex"
          width="auto"
          textAlign="center"
          alignItems="center"
          p={2}
          href={generateNavItemUrl(item)}
          target={!item.asPath && isAbsoluteUrl(item.href) ? '_blank' : undefined}
          rel={!item.asPath && isAbsoluteUrl(item.href) ? 'noopener noreferrer' : undefined}
          fontSize="sm"
          fontWeight={400}
          _hover={{
            textDecoration: 'none',
          }}
          _groupHover={{
            color: 'blue.default',
          }}
        >
          {item.label}
        </NextChakraLink>
      )}
    </Box>
  );
}

DesktopNavItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string,
    bgColor: PropTypes.string,
    titleColor: PropTypes.string,
    label: PropTypes.string.isRequired,
    href: PropTypes.string,
    asPath: PropTypes.string,
    icon: PropTypes.string,
    image: PropTypes.string,
    description: PropTypes.string,
    mainMenu: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      label: PropTypes.string,
      description: PropTypes.string,
      bgColor: PropTypes.string,
      titleColor: PropTypes.string,
      subMenu: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string,
        href: PropTypes.string,
        asPath: PropTypes.string,
        type: PropTypes.string,
      })),
    })),
    subMenu: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      href: PropTypes.string,
      asPath: PropTypes.string,
      type: PropTypes.string,
    })),
    slug: PropTypes.string,
    with_popover: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  }),
};
DesktopNavItem.defaultProps = {
  item: {},
};

export default memo(DesktopNavItem);

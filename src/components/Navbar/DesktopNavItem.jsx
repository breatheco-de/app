import {
  Box,
  Flex,
  Text,
  useColorModeValue,
  Button,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { memo } from 'react';
import Icon from '../Icon';
import { isAbsoluteUrl, parseQuerys } from '../../utils/url';
import NextChakraLink from '../NextChakraLink';
import useStyle from '../../hooks/useStyle';
import { ArrowDown } from '../Icon/components';

function DesktopNavItem({ item }) {
  const router = useRouter();
  const { hexColor, lightColor, fontColor, backgroundColor } = useStyle();
  const popoverBorderColor = useColorModeValue('gray.250', 'gray.dark');

  const getColorLink = (link) => {
    if (router?.pathname === link || router.asPath === link || router?.pathname.includes(link)) {
      return 'blue.default';
    }
    return lightColor;
  };

  const hasMainMenu = Array.isArray(item.mainMenu) && item.mainMenu.length > 0;

  if (item.id === 'read' && !item.mainMenu && item.subMenu) {
    return null;
  }

  return (
    <Box
      key={item.label}
      position="relative"
      role="group"
      _groupHover={{ display: 'block' }}
    >
      {hasMainMenu ? (
        <>
          <Button
            variant="unstyled"
            display="flex"
            flexDirection="row"
            fontWeight={400}
            color={lightColor}
            fontSize="14px"
            _hover={{
              textDecoration: 'none',
              color: 'blue.default',
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
          <Box
            bg={hexColor.lightGreyBackground}
            rounded="md"
            position="absolute"
            className="custom-popover"
            display="none"
            zIndex="100"
            gap="8px"
            border="1px solid"
            borderColor={popoverBorderColor}
            width={{ base: 'auto', lg: 'auto', xl: 'auto' }}
            role="group"
            _groupHover={{ display: 'flex' }}
            p="8px"
            boxShadow="lg"
          >
            <Box minWidth="300px" p="8px" backgroundColor={backgroundColor}>
              <Flex direction="column" gap={2}>
                <Text fontWeight="bold" fontSize="18px" color={hexColor.blueDefault} display="flex" alignItems="center" gap="8px">
                  {item.icon && <Icon icon={item.icon} color={hexColor.blueDefault} width="24px" height="24px" mb={2} />}
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
                  minWidth="300px"
                  minHeight="250px"
                  backgroundColor={backgroundColor}
                  p="8px"
                >
                  {mainMenuItem.label && (
                    <Text fontWeight="bold" color={hexColor.blueDefault} fontSize="12px" mb={1}>
                      {mainMenuItem.label}
                    </Text>
                  )}
                  {mainMenuItem.description && (
                    <Text fontSize="12px" color={lightColor} mb={2}>
                      {mainMenuItem.description}
                    </Text>
                  )}
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
                        href={`${subMenuItem.href}${mainMenuItem.id ? parseQuerys({ internal_cta_placement: `navbar-${mainMenuItem.id}-${subMenuItem.label.toLowerCase().replace(/ /g, '-')}` }, subMenuItem.href.includes('?')) : ''}`}
                        display="block"
                        py={1}
                        px={2}
                        ml={-2}
                        borderRadius="md"
                        _hover={{ color: 'blue.default' }}
                        color={getColorLink(subMenuItem.href)}
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
          </Box>
        </>
      ) : (
        <NextChakraLink
          display="flex"
          width="auto"
          textAlign="center"
          alignItems="center"
          p={2}
          href={`${item.href}${item.id ? parseQuerys({ internal_cta_placement: `navbar-${item.id}` }, item.href?.includes('?')) : ''}` ?? '#'}
          target={isAbsoluteUrl(item.href) ? '_blank' : undefined}
          rel={isAbsoluteUrl(item.href) ? 'noopener noreferrer' : undefined}
          fontSize="sm"
          fontWeight={700}
          color={getColorLink(item.href || item.asPath)}
          _hover={{
            textDecoration: 'none',
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
    color: PropTypes.string,
    label: PropTypes.string.isRequired,
    href: PropTypes.string,
    asPath: PropTypes.string,
    icon: PropTypes.string,
    image: PropTypes.string,
    description: PropTypes.string,
    mainMenu: PropTypes.arrayOf(PropTypes.shape({})),
    subMenu: PropTypes.arrayOf(PropTypes.shape({})),
    slug: PropTypes.string,
    with_popover: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  }),
};
DesktopNavItem.defaultProps = {
  item: {},
};

export default memo(DesktopNavItem);

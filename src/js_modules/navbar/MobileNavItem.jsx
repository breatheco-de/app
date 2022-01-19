import {
  Box,
  Flex,
  Text,
  Stack,
  Collapse,
  Link,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import NextChakraLink from '../../common/components/NextChakraLink';
import Icon from '../../common/components/Icon';
import { isAbsoluteUrl } from '../../utils/url';

const MobileNavItem = ({
  label, subMenu, href, description, icon,
}) => {
  const router = useRouter();
  const { isOpen, onToggle } = useDisclosure();
  const commonColor = useColorModeValue('gray.600', 'gray.300');

  const getColorLink = (link) => {
    if (router?.pathname === link || router?.pathname.includes(link)) {
      return 'blue.default';
    }
    return commonColor;
  };

  return (
    <Stack spacing={4} onClick={subMenu && onToggle}>
      {!subMenu && (
        <NextChakraLink
          py={2}
          // as={Link}
          href={href}
          target={isAbsoluteUrl(href) ? '_blank' : undefined}
          rel={isAbsoluteUrl(href) ? 'noopener noreferrer' : undefined}
          display="flex"
          justifyContent="space-between"
          align="center"
          _hover={{
            textDecoration: 'none',
          }}
        >
          <Text fontWeight={400} color={getColorLink(href)}>
            {label}
          </Text>
        </NextChakraLink>
      )}
      {subMenu && (
        <Flex
          py={2}
          justifyContent="left"
          gridGap="10px"
          align="center"
          _hover={{
            textDecoration: 'none',
          }}
        >
          <Text fontWeight={400} color={getColorLink(href)}>
            {label}
          </Text>
          <Box
            display="flex"
            onClick={(e) => e.preventDefault()}
            transition="all .25s ease-in-out"
            transform={isOpen ? 'rotate(90deg)' : 'rotate(0deg)'}
          >
            <Icon icon="arrowRight" color="gray" width="12px" height="12px" />
          </Box>
        </Flex>
      )}

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          pl={4}
          borderLeft="2px solid"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align="start"
        >
          <Flex
            flexDirection="row"
            padding="20px 0"
            gridGap="15px"
            borderBottom={1}
            borderStyle="solid"
            borderColor={useColorModeValue('gray.200', 'gray.900')}
            alignItems="center"
            color={commonColor}
          >
            <Box width="auto">
              <Icon icon={icon} width="50px" height="50px" />
            </Box>
            <Box display="flex" flexDirection="column">
              <Text size="xl" fontWeight={900}>
                {label}
              </Text>
              <Text color={commonColor} fontWeight={500}>
                {description}
              </Text>
            </Box>
          </Flex>

          {subMenu
            && subMenu.map((child) => (
              <Link
                key={child.label}
                color={getColorLink(child.href)}
                style={{ textDecoration: 'none' }}
                py={2}
                href={child.href}
              >
                {child.label}
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

MobileNavItem.propTypes = {
  label: PropTypes.string.isRequired,
  description: PropTypes.string,
  icon: PropTypes.string,
  href: PropTypes.string,
  subMenu: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      subLabel: PropTypes.string,
      href: PropTypes.string,
    }),
  ),
};

MobileNavItem.defaultProps = {
  href: '/',
  description: '',
  icon: 'book',
  subMenu: undefined,
};

export default MobileNavItem;

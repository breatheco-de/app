import {
  Box,
  Flex,
  Text,
  Stack,
  Collapse,
  useColorModeValue,
  useDisclosure,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
// import { useRouter } from 'next/router';
import Image from 'next/image';
import NextChakraLink from '../../common/components/NextChakraLink';
import Icon from '../../common/components/Icon';
import { isAbsoluteUrl } from '../../utils/url';

function MobileItem({
  label, subMenu, href, onClickLink, description, icon, readSyllabus, with_popover: withPopover, image,
}) {
  const { isOpen, onToggle } = useDisclosure();
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const bordercolor1 = useColorModeValue('gray.200', 'gray.700');
  const bordercolor2 = useColorModeValue('gray.200', 'gray.900');

  // const getColorLink = (link) => {
  //   if (router?.pathname === link || router.asPath === link || router?.pathname.includes(link)) {
  //     return 'blue.default';
  //   }
  //   return linkColor;
  // };
  const existsSubMenu = subMenu?.length > 0;
  const withPopoverActive = withPopover?.active;
  const existsItemWithPopover = existsSubMenu || withPopoverActive;
  // manage subMenus in level 2
  const itemSubMenu = existsSubMenu && subMenu.map((l) => {
    const isLessons = l.slug === 'lessons';
    if (isLessons) {
      return ({
        ...l,
        subMenu: [...readSyllabus, ...l.subMenuContent],
      });
    }
    return l;
  });

  return (
    <Stack spacing={4}>
      {/* Box is important for popover content trigger */}
      {!subMenu && (
        <Box>
          <NextChakraLink
            py={2}
            href={href}
            target={isAbsoluteUrl(href) ? '_blank' : undefined}
            rel={isAbsoluteUrl(href) ? 'noopener noreferrer' : undefined}
            display="flex"
            onClick={onClickLink}
            justifyContent="space-between"
            align="center"
            _hover={{
              textDecoration: 'none',
              color: 'blue.default',
            }}
          >
            <Text fontWeight={400}>
              {label}
            </Text>
          </NextChakraLink>
        </Box>
      )}
      {existsItemWithPopover && (
        <Flex
          py={2}
          justifyContent="left"
          gridGap="10px"
          align="center"
          cursor="pointer"
          onClick={subMenu && onToggle}
          _hover={{
            textDecoration: 'none',
          }}
        >
          <Text fontWeight={400}>
            {label}
          </Text>
          <Box
            display="flex"
            onClick={(e) => e.preventDefault()}
            transition="all .25s ease-in-out"
            transform={isOpen ? 'rotate(90deg)' : 'rotate(0deg)'}
          >
            <Icon icon="arrowRight" color="currentColor" width="12px" height="12px" />
          </Box>
        </Flex>
      )}

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          pl={4}
          borderLeft="2px solid"
          borderColor={bordercolor1}
          align="start"
        >
          <Flex
            flexDirection="column"
            padding={withPopoverActive ? '0px' : '0 0 20px 0'}
            gridGap="15px"
            borderBottom={withPopoverActive ? 0 : 1}
            borderStyle="solid"
            borderColor={bordercolor2}
            alignItems="start"
            color={linkColor}
          >
            <Box width="auto">
              {image ? (
                <Image src={image} width={105} height={35} style={{ objectFit: 'cover', height: '35px' }} />
              ) : (
                <Icon icon={icon} width="50px" height="50px" />
              )}
            </Box>
            <Box display="flex" flexDirection="column">
              <Text size="xl" fontWeight={900}>
                {label}
              </Text>
              <Text color={linkColor} fontWeight={500}>
                {description}
              </Text>
              {withPopoverActive && (
                <NextChakraLink
                  href={withPopover.link}
                  key={withPopover.link}
                  display="block"
                  p="0.8rem 0"
                  width="max-content"
                  style={{ borderRadius: '5px' }}
                >
                  {withPopover?.title}
                  <Icon icon="arrowRight" width="12px" height="12px" color="#0097CD" style={{ display: 'inline', marginLeft: '8px' }} />
                </NextChakraLink>
              )}
            </Box>
          </Flex>

          {itemSubMenu
            && itemSubMenu.map((child) => (child.subMenu ? (
              <Accordion key={child.label} allowMultiple width="100%">
                <AccordionItem border="0">
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      {child.label}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    {child.description && (
                      <Text fontSize="14px" textAlign="left" pb="15px">
                        {child.description}
                      </Text>
                    )}
                    <Box display="flex" flexDirection="column" gridGap="15px">
                      {child.subMenu.map((l) => (
                        <NextChakraLink
                          key={l.label}
                          onClick={onClickLink}
                          // color={getColorLink(l.href)}
                          style={{ textDecoration: 'none' }}
                          href={l.href}
                        >
                          {l.label}
                        </NextChakraLink>
                      ))}
                    </Box>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            ) : (
              <NextChakraLink
                key={child.label}
                onClick={onClickLink}
                // color={getColorLink(child.href)}
                style={{ textDecoration: 'none' }}
                py={2}
                href={child.href}
              >
                {child.label}
              </NextChakraLink>
            )))}
        </Stack>
      </Collapse>
    </Stack>
  );
}

MobileItem.propTypes = {
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
  with_popover: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  image: PropTypes.string,
  onClickLink: PropTypes.func.isRequired,
  readSyllabus: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
};

MobileItem.defaultProps = {
  href: '/',
  description: '',
  icon: 'book',
  with_popover: {},
  image: '',
  subMenu: undefined,
};

export default MobileItem;

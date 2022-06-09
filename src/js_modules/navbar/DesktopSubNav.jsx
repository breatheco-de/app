import {
  Box, Flex, Text, Stack, useColorModeValue, Tab, Tabs, TabList, TabPanels,
  TabPanel,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Icon from '../../common/components/Icon';
import NextChakraLink from '../../common/components/NextChakraLink';
import CustomText from '../../common/components/Text';

const DesktopSubNav = ({
  label, href, subLabel, subMenu,
}) => {
  const router = useRouter();
  const linkColor = useColorModeValue('gray.600', 'gray.300');
  const [clicked, setClicked] = useState(false);

  const getColorLink = (link) => {
    if (router?.pathname === link || router.asPath === link || router?.pathname.includes(link)) {
      return 'blue.default';
    }
    return linkColor;
  };
  return subMenu.length <= 0 ? (
    <NextChakraLink
      href={href}
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
            color={getColorLink(href)}
            _groupHover={{ color: useColorModeValue('gray.900', 'featuredLight') }}
            fontWeight={500}
          >
            {label}
          </Text>
          {/* optional short description */}
          <Text fontSize="sm">{subLabel}</Text>
        </Box>
        <Flex
          transition="all .3s ease"
          transform="translateX(-10px)"
          opacity={0}
          _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
          justify="flex-end"
          align="center"
          flex={1}
        >
          <Icon
            icon="arrowRight"
            color={useColorModeValue('#A4A4A4', '#EEF9FE')}
            width="15px"
            height="15px"
          />
        </Flex>
      </Stack>
    </NextChakraLink>
  ) : (
    <Tabs
      defaultIndex={0}
      display="flex"
      flexDirection={{ base: 'column', md: 'row' }}
      gridGap="10px"
      index={clicked ? 0 : -1}
      onClick={() => setClicked(!clicked)}
      variant="unstyled"
      role="group"
      borderRadius="5px"
      // p={2}
      // style={{ borderRadius: '5px' }}
      _hover={{ bg: useColorModeValue('featuredLight', 'gray.900') }}
    >
      <TabList display="flex" flexDirection={{ base: 'row', md: 'column' }} width={{ base: '100%', md: 'auto' }}>
        <Tab _selected={{ borderLeft: '4px solid', borderColor: 'blue.default' }} p={2} textAlign="left">
          {label}
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <CustomText fontSize="14px">
            It makes sense to start learning by reading and watching videos about fundamentals
            and how things work.
          </CustomText>
          {subMenu.map((item) => (
            <NextChakraLink
              href={item.href}
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
                    color={getColorLink(item.href)}
                    _groupHover={{ color: useColorModeValue('gray.900', 'featuredLight') }}
                    fontWeight={500}
                  >
                    {item.label}
                  </Text>
                </Box>
                <Flex
                  transition="all .3s ease"
                  transform="translateX(-10px)"
                  opacity={0}
                  _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
                  justify="flex-end"
                  align="center"
                  flex={1}
                >
                  <Icon
                    icon="arrowRight"
                    color={useColorModeValue('#A4A4A4', '#EEF9FE')}
                    width="15px"
                    height="15px"
                  />
                </Flex>
              </Stack>
            </NextChakraLink>
          ))}
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};
  // <Button
  //   variant="unstyled"
  // onClick={() => console.log('test:::')}
  // role="group"
  // display="block"
  // p={2}
  // style={{ borderRadius: '5px' }}
  // _hover={{ bg: useColorModeValue('featuredLight', 'gray.900') }}
  // >
  //   <Stack direction="row" align="center">
  //     <Box>
  //       <Text
  //         transition="all .3s ease"
  //         color={getColorLink(href)}
  //         _groupHover={{ color: useColorModeValue('gray.900', 'featuredLight') }}
  //         fontWeight={500}
  //       >
  //         {label}
  //       </Text>
  //       {/* optional short description */}
  //       <Text fontSize="sm">{subLabel}</Text>
  //     </Box>
  //     <Flex
  //       transition="all .3s ease"
  //       transform="translateX(-10px)"
  //       opacity={0}
  //       _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
  //       justify="flex-end"
  //       align="center"
  //       flex={1}
  //     >
  //       <Icon
  //         icon="arrowRight"
  //         color={useColorModeValue('#A4A4A4', '#EEF9FE')}
  //         width="15px"
  //         height="15px"
  //       />
  //     </Flex>
  //   </Stack>
  // </Button>

DesktopSubNav.propTypes = {
  label: PropTypes.string.isRequired,
  href: PropTypes.string,
  subLabel: PropTypes.string,
  subMenu: PropTypes.arrayOf(PropTypes.object),
};

DesktopSubNav.defaultProps = {
  href: '/',
  subLabel: '',
  subMenu: [],
};

export default DesktopSubNav;

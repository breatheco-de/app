import {
  Box,
  IconButton,
  Stack,
  useColorModeValue,
  useColorMode,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Icon from '../../common/components/Icon';
import MobileItem from './MobileItem';
import LanguageSelector from '../../common/components/LanguageSelector';
// import UpgradeExperience from '../../common/components/UpgradeExperience';

const MobileNav = ({
  // eslint-disable-next-line no-unused-vars
  NAV_ITEMS, readSyllabus, haveSession, translations, mktCourses,
}) => {
  const [privateItems, setPrivateItems] = useState([]);
  const { colorMode, toggleColorMode } = useColorMode();
  const commonColors = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    if (haveSession) {
      setPrivateItems(NAV_ITEMS.filter((item) => item.private === true));
    }
  }, [haveSession]);
  const publicItems = NAV_ITEMS.filter((item) => item.private !== true);

  const customPublicItems = publicItems.map((publicItem) => {
    if (publicItem.asPath === '/read' && readSyllabus.length > 0) {
      publicItem.subMenu.map((l) => {
        if (l.asPath === '/read-and-watch') {
          const courseFetched = readSyllabus;
          const menus = [...courseFetched, ...l.subMenuContent];

          // eslint-disable-next-line no-param-reassign
          l.subMenu = menus;
        }
        return l;
      });
    }
    return publicItem;
  });

  return (
    <Stack
      position="absolute"
      width="100%"
      zIndex="99"
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      // display={{ md: 'none' }}
      borderBottom={1}
      borderStyle="solid"
      borderColor={useColorModeValue('gray.200', 'gray.900')}
    >
      {privateItems.length > 0 && privateItems.map((privateItem) => {
        const {
          label, subMenu, href, asPath, description, icon,
        } = privateItem;
        return (
          <MobileItem
            key={label}
            description={description}
            icon={icon}
            label={label}
            subMenu={subMenu}
            href={href}
            asPath={asPath}
          />
        );
      })}

      {customPublicItems.map((publicItem) => {
        const {
          label, subMenu, href, description, icon,
        } = publicItem;
        return (
          <MobileItem
            key={label}
            description={description}
            icon={icon}
            label={label}
            subMenu={subMenu}
            href={href}
          />
        );
      })}
      {/* {mktCourses?.length > 0 && (
        <Box display={{ base: 'block', md: 'none' }}>
          <UpgradeExperience data={mktCourses} />
        </Box>
      )} */}

      <Box
        borderTop={1}
        borderStyle="solid"
        display="flex"
        padding="14px 0 0 0"
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        justifyContent="center"
        gridGap="20px"
      >
        <IconButton
          // style={{ margin: '14px auto 0 auto' }}
          display="flex"
          _hover={{
            background: commonColors,
          }}
          _active={{
            background: commonColors,
          }}
          background={commonColors}
          onClick={toggleColorMode}
          icon={
            colorMode === 'light' ? (
              <Icon icon="light" width="25px" height="23px" color="black" />
            ) : (
              <Icon icon="dark" width="20px" height="20px" />
            )
          }
        />
        <LanguageSelector display="block" translations={translations} />
      </Box>
    </Stack>
  );
};

MobileNav.propTypes = {
  haveSession: PropTypes.bool.isRequired,
  NAV_ITEMS: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      description: PropTypes.string,
      icon: PropTypes.string,
      href: PropTypes.string,
      subMenu: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string,
          subLabel: PropTypes,
          href: PropTypes.string,
        }),
      ),
    }),
  ),
  translations: PropTypes.oneOfType([PropTypes.objectOf(PropTypes.any), PropTypes.arrayOf(PropTypes.any)]),
  readSyllabus: PropTypes.arrayOf(PropTypes.any),
  mktCourses: PropTypes.arrayOf(PropTypes.any),
};

MobileNav.defaultProps = {
  NAV_ITEMS: [
    {
      href: '/',
      description: '',
      icon: 'book',
      subMenu: {
        subLabel: '',
      },
    },
  ],
  readSyllabus: [],
  translations: undefined,
  mktCourses: [],
};

export default MobileNav;

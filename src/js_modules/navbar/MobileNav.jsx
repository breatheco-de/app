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
import syllabusList from '../../../public/syllabus.json';
// import UpgradeExperience from '../../common/components/UpgradeExperience';

function MobileNav({
  // eslint-disable-next-line no-unused-vars
  NAV_ITEMS, haveSession, translations, mktCourses, onClickLink,
}) {
  const [privateItems, setPrivateItems] = useState([]);
  const { colorMode, toggleColorMode } = useColorMode();
  const commonColors = useColorModeValue('white', 'gray.800');
  const readSyllabus = JSON.parse(syllabusList);
  const prismicRef = process.env.PRISMIC_REF;
  const prismicApi = process.env.PRISMIC_API;

  useEffect(() => {
    if (haveSession) {
      setPrivateItems(NAV_ITEMS.filter((item) => item.private === true));
    }
  }, [haveSession]);
  const publicItems = NAV_ITEMS.filter((item) => item.private !== true);

  const customPublicItems = publicItems;
  const allItems = [...privateItems, ...customPublicItems];

  // manage submenus in level 1
  const prepareSubMenuData = (item) => {
    if (item.slug === 'social-and-live-learning') {
      return mktCourses;
    }
    return item?.subMenu;
  };
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
      {customPublicItems.length > 0 && allItems.map((item) => {
        const {
          label, href, description, icon,
        } = item;
        const submenuData = prepareSubMenuData(item);

        if (item.slug === 'social-and-live-learning' && !prismicRef && !prismicApi) {
          return null;
        }

        return (
          <MobileItem
            key={label}
            description={description}
            icon={icon}
            label={label}
            subMenu={item?.subMenu?.length > 1
              ? item?.subMenu
              : submenuData}
            href={href}
            onClickLink={onClickLink}
            readSyllabus={readSyllabus}
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
          title="Toggle Color Mode"
          icon={
            colorMode === 'light' ? (
              <Icon icon="light" id="light-button-mobile" width="25px" height="23px" color="black" />
            ) : (
              <Icon icon="dark" id="dark-button-mobile" width="20px" height="20px" />
            )
          }
        />
        <LanguageSelector display="block" translations={translations} />
      </Box>
    </Stack>
  );
}

MobileNav.propTypes = {
  haveSession: PropTypes.bool.isRequired,
  NAV_ITEMS: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  translations: PropTypes.oneOfType([PropTypes.objectOf(PropTypes.any), PropTypes.arrayOf(PropTypes.any)]),
  onClickLink: PropTypes.func.isRequired,
  mktCourses: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]),
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
  translations: undefined,
  mktCourses: [],
};

export default MobileNav;

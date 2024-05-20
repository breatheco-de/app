import {
  Box,
  IconButton,
  useColorModeValue,
  useColorMode,
  Flex,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import Icon from '../../common/components/Icon';
import MobileItem from './MobileItem';
import LanguageSelector from '../../common/components/LanguageSelector';
// import syllabusList from '../../../public/syllabus.json';
import NextChakraLink from '../../common/components/NextChakraLink';
// import UpgradeExperience from '../../common/components/UpgradeExperience';
import useStyle from '../../common/hooks/useStyle';
// import UpgradeExperience from '../../common/components/UpgradeExperience';

function MobileNav({
  // eslint-disable-next-line no-unused-vars
  NAV_ITEMS, haveSession, translations, mktCourses, onClickLink, isAuthenticated, hasPaidSubscription,
}) {
  const [privateItems, setPrivateItems] = useState([]);
  const { colorMode, toggleColorMode } = useColorMode();
  const { t } = useTranslation('navbar');
  const commonColors = useColorModeValue('white', 'gray.800');
  // const readSyllabus = JSON.parse(syllabusList);
  const prismicRef = process.env.PRISMIC_REF;
  const prismicApi = process.env.PRISMIC_API;
  const { borderColor } = useStyle();

  useEffect(() => {
    const hasNavItems = NAV_ITEMS?.length > 0;

    if (haveSession && hasNavItems) {
      setPrivateItems(NAV_ITEMS.filter((item) => item?.private));
    }
  }, [haveSession, NAV_ITEMS]);
  const publicItems = NAV_ITEMS.filter((item) => !item.private) || [];
  const customPublicItems = [...publicItems];
  const allItems = [...privateItems, ...customPublicItems];
  const itemListAsc = allItems.sort((a, b) => a.position - b.position);

  // manage submenus in level 1
  const prepareSubMenuData = (item) => {
    if (item.id === 'bootcamps') {
      return mktCourses;
    }
    return item?.subMenu;
  };

  return (
    <Flex
      flexDirection="column"
      position="absolute"
      width="100%"
      zIndex="99"
      gridGap="8px"
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      // display={{ md: 'none' }}
      borderBottom={1}
      borderStyle="solid"
      borderColor={useColorModeValue('gray.200', 'gray.900')}
    >
      {itemListAsc?.length > 0 && itemListAsc.map((item) => {
        const {
          label, href, description, icon,
        } = item;
        const submenuData = prepareSubMenuData(item);

        if (item.slug === 'courses' && !prismicRef && !prismicApi) {
          return null;
        }

        return (
          <MobileItem
            key={label}
            with_popover={item?.with_popover}
            image={item?.image}
            description={description}
            icon={icon}
            label={label}
            subMenu={item?.subMenu?.length > 1
              ? item?.subMenu
              : submenuData}
            href={href}
            onClickLink={onClickLink}
            readSyllabus={[]}
          />
        );
      })}
      {/* {mktCourses?.length > 0 && (
        <Box display={{ base: 'block', md: 'none' }}>
          <UpgradeExperience data={mktCourses} />
        </Box>
      )} */}

      <Box display={{ base: 'flex', md: 'none' }} padding="0.5rem 0">
        <NextChakraLink
          href="/login"
          fontSize="16px"
          lineHeight="22px"
          margin="0"
          _hover={{
            textDecoration: 'none',
            color: 'blue.default',
          }}
          letterSpacing="0.05em"
        >
          {t('login')}
        </NextChakraLink>
      </Box>

      {/* {isAuthenticated && !hasPaidSubscription && (
        <Box
          margin="0 0 1rem 0"
          borderTop={1}
          borderStyle="solid"
          padding="1.45rem 0 0 0"
          borderColor={borderColor}
        >
          <UpgradeExperience width="100%" display={{ base: 'flex', sm: 'none' }} />
        </Box>
      )} */}
      <Box
        borderTop={1}
        borderStyle="solid"
        borderColor={borderColor}
        display="flex"
        padding="14px 0 0 0"
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
    </Flex>
  );
}

MobileNav.propTypes = {
  haveSession: PropTypes.bool.isRequired,
  NAV_ITEMS: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  translations: PropTypes.oneOfType([PropTypes.objectOf(PropTypes.any), PropTypes.arrayOf(PropTypes.any)]),
  onClickLink: PropTypes.func.isRequired,
  mktCourses: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]),
  isAuthenticated: PropTypes.bool.isRequired,
  hasPaidSubscription: PropTypes.bool.isRequired,
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

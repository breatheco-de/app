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
import { useRouter } from 'next/router';
import Icon from '../Icon';
import MobileItem from './MobileItem';
import LanguageSelector from '../LanguageSelector';
import NextChakraLink from '../NextChakraLink';
import useStyle from '../../hooks/useStyle';
import useAuth from '../../hooks/useAuth';
import { setStorageItem } from '../../../utils';

function MobileNav({
  navbarItems, translations, mktCourses, onClickLink,
}) {
  const [privateItems, setPrivateItems] = useState([]);
  const { colorMode, toggleColorMode } = useColorMode();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation('navbar');
  const router = useRouter();
  const commonColors = useColorModeValue('white', 'gray.800');
  const prismicRef = process.env.PRISMIC_REF;
  const prismicApi = process.env.PRISMIC_API;
  const { borderColor } = useStyle();

  useEffect(() => {
    const hasNavItems = navbarItems?.length > 0;

    if (isAuthenticated && hasNavItems) {
      setPrivateItems(navbarItems.filter((item) => item?.private));
    }
  }, [isAuthenticated, navbarItems]);
  const publicItems = navbarItems.filter((item) => !item.private) || [];
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

      <Box display={{ base: 'flex', md: 'none' }} padding="0.5rem 0">
        <NextChakraLink
          href="/login"
          onClick={() => setStorageItem('redirect', router?.asPath)}
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
  navbarItems: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  translations: PropTypes.oneOfType([PropTypes.objectOf(PropTypes.any), PropTypes.arrayOf(PropTypes.any)]),
  onClickLink: PropTypes.func.isRequired,
  mktCourses: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]),
};

MobileNav.defaultProps = {
  navbarItems: [
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

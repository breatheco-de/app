import {
  Box,
  IconButton,
  useColorModeValue,
  useColorMode,
  Flex,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import Icon from '../Icon';
import MobileNavItem from './MobileNavItem';
import LanguageSelector from '../LanguageSelector';
import NextChakraLink from '../NextChakraLink';
import useStyle from '../../../hooks/useStyle';
import { setStorageItem } from '../../../utils';

function MobileNav({
  navbarItems, translations, onClickLink,
}) {
  const { colorMode, toggleColorMode } = useColorMode();
  const { t } = useTranslation('navbar');
  const router = useRouter();
  const prismicRef = process.env.PRISMIC_REF;
  const prismicApi = process.env.PRISMIC_API;
  const { borderColor, navbarBackground } = useStyle();

  return (
    <Flex
      flexDirection="column"
      position="absolute"
      width="100%"
      zIndex="99"
      gridGap="8px"
      bg={navbarBackground}
      p={4}
      borderBottom={1}
      borderStyle="solid"
      borderColor={useColorModeValue('gray.200', 'gray.900')}
    >
      {navbarItems.map((item) => {
        const {
          label, href, description, icon, subMenu,
        } = item;

        if (item.slug === 'courses' && !prismicRef && !prismicApi) {
          return null;
        }

        return (
          <MobileNavItem
            key={label}
            with_popover={item?.with_popover}
            image={item?.image}
            description={description}
            icon={icon}
            label={label}
            subMenu={subMenu}
            href={href}
            onClickLink={onClickLink}
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
            background: navbarBackground,
          }}
          _active={{
            background: navbarBackground,
          }}
          background={navbarBackground}
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
};

export default MobileNav;

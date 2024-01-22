import { useState } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import {
  Box,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import styles from '../../../styles/flags.module.css';
import navbarTR from '../translations/navbar';
import bc from '../services/breathecode';
import useAuth from '../hooks/useAuth';
import NextChakraLink from './NextChakraLink';
import useSession from '../hooks/useSession';

function LanguageSelector({ display, translations, ...rest }) {
  const { userSession } = useSession();
  const router = useRouter();
  const { t } = useTranslation('common');
  const { isAuthenticated } = useAuth();
  const locale = router.locale === 'default' ? 'en' : router.locale;
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');

  const {
    languagesTR,
  } = navbarTR[locale];
  const [languagesOpen, setLanguagesOpen] = useState(false);
  const currentLanguage = languagesTR.filter((l) => l.value === locale)[0];
  const externalTranslations = userSession?.translations || translations;
  const translationsPropsExists = externalTranslations?.length > 0;
  const currentTranslationLanguage = translationsPropsExists && externalTranslations?.find((l) => l.lang === locale);
  const translationData = (translationsPropsExists && externalTranslations) || languagesTR;

  const updateSettingsLang = async (lang) => {
    try {
      if (isAuthenticated) {
        await bc.auth().updateSettings({ lang });
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Popover
      id="Language-Hover"
      isOpen={languagesOpen}
      onClose={() => setLanguagesOpen(false)}
      placement="bottom-start"
      trigger="click"
    >
      <PopoverTrigger>
        <Button
          padding="0"
          display={display}
          aria-label="Language Selector"
          textAlign="-webkit-center"
          height="auto"
          isDisabled={externalTranslations?.length === 1}
          title={externalTranslations?.length === 1 ? t('no-translation-available') : ''}
          backgroundColor="transparent"
          width="auto"
          alignSelf="center"
          _hover={{
            background: 'transparent',
          }}
          _active={{
            background: 'transparent',
          }}
          onClick={() => setLanguagesOpen(!languagesOpen)}
          {...rest}
        >
          <Box
            className={`${styles.flag} ${styles[currentTranslationLanguage?.lang || currentLanguage?.value]}`}
            width="25px"
            height="25px"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        // border={0}
        // boxShadow="dark-lg"
        bg={popoverContentBgColor}
        rounded="md"
        width={{ base: '100%', md: 'auto' }}
        minW="210px"
      >
        <PopoverArrow />
        <Box
          width="100%"
          display="flex"
          boxShadow="2xl"
          flexDirection="column"
          gridGap="10px"
          padding="12px"
        >
          {translationData.map((l) => {
            const currLang = languagesTR.filter((language) => language?.value === l?.lang)[0];
            const value = translationsPropsExists ? currLang?.value : l.value;
            const label = translationsPropsExists ? currLang?.label : l.label;
            const path = translationsPropsExists ? l?.link : router.asPath;

            const cleanedPath = (path === '/' && value !== 'en') ? '' : path;
            const link = cleanedPath;

            return (
              <NextChakraLink
                width="100%"
                key={value}
                href={link}
                locale={value}
                alignSelf="center"
                display="flex"
                gridGap={5}
                fontWeight="bold"
                textDecoration="none"
                opacity={locale === value ? 1 : 0.75}
                _hover={{
                  opacity: 1,
                }}
                onClick={async () => {
                  await updateSettingsLang(l.value);
                }}
              >
                <Box className={`${styles.flag} ${styles[value]}`} width="25px" height="25px" />
                {label}
              </NextChakraLink>
            );
          })}
        </Box>
      </PopoverContent>
    </Popover>
  );
}

LanguageSelector.propTypes = {
  translations: PropTypes.oneOfType([PropTypes.objectOf(PropTypes.any), PropTypes.arrayOf(PropTypes.any)]),
  display: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
};

LanguageSelector.defaultProps = {
  translations: {},
};

export default LanguageSelector;

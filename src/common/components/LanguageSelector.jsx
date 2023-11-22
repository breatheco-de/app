import { useState } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import {
  Box,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  Link,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import styles from '../../../styles/flags.module.css';
import navbarTR from '../translations/navbar';

function LanguageSelector({ display, translations }) {
  const router = useRouter();
  const { t } = useTranslation('common');
  const locale = router.locale === 'default' ? 'en' : router.locale;
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');

  const {
    languagesTR,
  } = navbarTR[locale];
  const [languagesOpen, setLanguagesOpen] = useState(false);
  const currentLanguage = languagesTR.filter((l) => l.value === locale)[0];
  const translationsPropsExists = translations?.length > 0;
  const currentTranslationLanguage = translationsPropsExists && translations?.find((l) => l.lang === locale);
  const translationData = (translationsPropsExists && translations) || languagesTR;

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
          isDisabled={translations?.length === 1}
          title={translations?.length === 1 ? t('no-translation-available') : ''}
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
            const localePrefix = `${value !== 'en' && !cleanedPath.includes(`/${value}`) ? `/${value}` : ''}`;

            const link = `${localePrefix}${cleanedPath}`;

            return (
              <Link
                width="100%"
                key={value}
                href={link}
                role="group"
                alignSelf="center"
                display="flex"
                gridGap="5px"
                fontWeight="bold"
                textDecoration="none"
                opacity={locale === value ? 1 : 0.75}
                _hover={{
                  opacity: 1,
                }}
              >
                <Box className={`${styles.flag} ${styles[value]}`} width="25px" height="25px" />
                {label}
              </Link>
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

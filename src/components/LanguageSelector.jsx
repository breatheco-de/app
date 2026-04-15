import { useRef, useState } from 'react';
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
import styles from '../../styles/flags.module.css';
import bc from '../services/breathecode';
import useAuth from '../hooks/useAuth';
import useSession from '../hooks/useSession';

function LanguageSelector({ display, translations, ...rest }) {
  const { userSession } = useSession();
  const router = useRouter();
  const { t } = useTranslation('common');
  const { isAuthenticated } = useAuth();
  const locale = router.locale === 'default' ? 'en' : router.locale;
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');

  const languages = t('navbar:languages', {}, { returnObjects: true });
  const [languagesOpen, setLanguagesOpen] = useState(false);
  const isNavigatingRef = useRef(false);
  const currentLanguage = languages.filter((l) => l.value === locale)[0];
  const externalTranslations = userSession?.translations || translations;
  const translationsPropsExists = externalTranslations?.length > 0;
  const currentTranslationLanguage = translationsPropsExists && externalTranslations?.find((l) => l.lang === locale);
  const translationData = (translationsPropsExists && externalTranslations) || languages;

  const updateSettingsLang = async (lang) => {
    try {
      if (isAuthenticated) {
        await bc.auth().updateSettings({ lang });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const normalizeLocalePath = (targetPath) => {
    const currentPath = targetPath || '/';
    return currentPath.replace(/^\/(es|en|us)(?=\/|$)/, '') || '/';
  };

  const isPublicAssetPath = (targetPath) => {
    const pathWithoutQuery = (targetPath || '').split('?')[0];
    return /^\/(es\/)?(lesson|how-to|como|interactive-coding-tutorial|interactive-exercise)\/[^/]+$/.test(pathWithoutQuery);
  };

  const getNavigationTarget = (targetLocale, targetPath) => {
    const currentPath = targetPath || '/';

    if (translationsPropsExists) {
      const cacheBust = isPublicAssetPath(currentPath) ? `__langSwitch=${Date.now()}` : '';
      const separator = currentPath.includes('?') ? '&' : '?';

      return {
        href: cacheBust ? `${currentPath}${separator}${cacheBust}` : currentPath,
        as: currentPath,
        locale: false,
      };
    }

    const normalizedPath = normalizeLocalePath(targetPath);
    let visiblePath = normalizedPath;
    if (targetLocale !== 'en') {
      visiblePath = normalizedPath === '/' ? `/${targetLocale}` : `/${targetLocale}${normalizedPath}`;
    }
    const cacheBust = isPublicAssetPath(targetPath) ? `__langSwitch=${Date.now()}` : '';
    const separator = normalizedPath.includes('?') ? '&' : '?';
    const href = cacheBust ? `${normalizedPath}${separator}${cacheBust}` : normalizedPath;

    return {
      href,
      as: visiblePath,
      locale: targetLocale,
    };
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
            const currLang = languages.filter((language) => language?.value === l?.lang)[0];
            const value = translationsPropsExists ? currLang?.value : l.value;
            const label = translationsPropsExists ? currLang?.label : l.label;
            const path = translationsPropsExists ? l?.link : router.asPath;
            const navigationTarget = getNavigationTarget(value, path);

            return (
              <Box
                as="button"
                type="button"
                width="100%"
                key={value}
                alignSelf="center"
                display="flex"
                gridGap={5}
                fontWeight="bold"
                textDecoration="none"
                textAlign="left"
                background="transparent"
                border="none"
                cursor="pointer"
                opacity={locale === value ? 1 : 0.75}
                _hover={{
                  opacity: 1,
                }}
                onClick={async () => {
                  if (isNavigatingRef.current || locale === value) {
                    setLanguagesOpen(false);
                    return;
                  }

                  isNavigatingRef.current = true;
                  await updateSettingsLang(value);
                  setLanguagesOpen(false);
                  router.push(
                    navigationTarget.href,
                    navigationTarget.as,
                    { locale: navigationTarget.locale },
                  ).catch(() => {
                    isNavigatingRef.current = false;
                  }).finally(() => {
                    isNavigatingRef.current = false;
                  });
                }}
              >
                <Box className={`${styles.flag} ${styles[value]}`} width="25px" height="25px" />
                {label}
              </Box>
            );
          })}
        </Box>
      </PopoverContent>
    </Popover>
  );
}

LanguageSelector.propTypes = {
  translations: PropTypes.oneOfType([PropTypes.objectOf(PropTypes.any), PropTypes.arrayOf(PropTypes.any)]),
  display: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
};

LanguageSelector.defaultProps = {
  translations: {},
  display: 'block',
};

export default LanguageSelector;

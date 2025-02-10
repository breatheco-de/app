import React from 'react';
import {
  Container,
  Text,
  Flex,
  Divider,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import logoData from '../../../public/logo.json';
import NextChakraLink from './NextChakraLink';
import useAuth from '../hooks/useAuth';

function FooterTC({ pageProps }) {
  const { t } = useTranslation('footer');
  const { isAuthenticated } = useAuth();
  const copyrightName = pageProps?.existsWhiteLabel ? logoData.name : '4Geeks';
  const actualYear = new Date().getFullYear();
  const router = useRouter();
  const noFooterRoutes = [
    '/cohort/[cohortSlug]/[slug]/[version]',
    '/syllabus/[cohortSlug]/[lesson]/[lessonSlug]',
    '/main-cohort/[mainCohortSlug]/syllabus/[cohortSlug]/[lesson]/[lessonSlug]',
    '/mentorship/schedule',
  ];

  if (noFooterRoutes.includes(router.pathname)) {
    return null;
  }

  return (
    <Container as={isAuthenticated && 'footer'} maxW>
      <Divider borderBottomWidth="2px" marginTop={isAuthenticated && '50px'} />
      <Flex
        key="copyright"
        padding="20px 20px 5px 20px"
        justifyContent={['center', 'center', 'space-between', 'space-between']}
        wrap={['wrap', 'wrap', 'nowrap', 'nowrap']}
        textAlign="center"
      >
        <Text marginBottom={['20px', '20px', '0', '0']} fontSize="sm">{t('copyright', { name: copyrightName, year: actualYear })}</Text>
        <Flex
          wrap={['wrap', 'wrap', 'nowrap', 'nowrap']}
          justifyContent={['center', 'center', 'space-between', 'space-between']}
          width={['100%', '100%', '35%', '25%']}
        >
          <NextChakraLink href={t('code-of-conduct.href')}>
            <Text fontSize="sm">{t('code-of-conduct.label')}</Text>
          </NextChakraLink>
          <NextChakraLink href={t('terms.href')}>
            <Text fontSize="sm">{t('terms.label')}</Text>
          </NextChakraLink>
          <NextChakraLink href={t('privacy.href')}>
            <Text fontSize="sm">{t('privacy.label')}</Text>
          </NextChakraLink>
        </Flex>
      </Flex>
    </Container>
  );
}

FooterTC.propTypes = {
  pageProps: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
};

FooterTC.defaultProps = {
  pageProps: {},
};

export default FooterTC;

import {
  Flex, Stack, Box, Image,
} from '@chakra-ui/react';
// import I from 'next/image';
import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
// import logo from '../../../public/static/images/bc_logo.png';
import getT from 'next-translate/getT';
import PropTypes from 'prop-types';
import Login from '../../components/Forms/LogIn';
import useAuth from '../../hooks/useAuth';
import useWhiteLabel from '../../hooks/useWhiteLabel';
import Icon from '../../components/Icon';
import { isWindow, languageFix } from '../../utils';
import logoData from '../../../public/logo.json';
import MarkDownParser from '../../components/MarkDownParser';

export const getStaticProps = async ({ locale, locales }) => {
  const t = await getT(locale, 'login');
  const keywords = t('seo.keywords', {}, { returnObjects: true });

  const ogUrl = {
    en: '/login',
    us: '/login',
  };

  return {
    props: {
      seo: {
        title: t('seo.title'),
        description: t('seo.description'),
        keywords,
        locales,
        locale,
        url: ogUrl.en || `/${locale}/login`,
        pathConnector: '/login',
      },
    },
  };
};

function LoginView({ existsWhiteLabel }) {
  const { user } = useAuth();
  const router = useRouter();
  const { whiteLabelParams, isLoading } = useWhiteLabel();

  useEffect(() => {
    if (user !== null && user !== undefined) {
      const redirect = isWindow && localStorage.getItem('redirect');
      if (redirect && redirect.length > 0 && isWindow) {
        router.push(redirect).then(() => {
          localStorage.removeItem('redirect');
        });
      } else {
        router.push('/choose-program');
      }
    }
  }, [user]);

  // Obtener el contenido de markdown según el idioma actual desde el contexto
  const markdownContent = useMemo(() => {
    if (!whiteLabelParams) return null;

    const params = whiteLabelParams.white_label_params || whiteLabelParams;
    if (!params) return null;

    const locale = router.locale === 'default' ? 'en' : router.locale;
    const content = languageFix(params, locale);

    return content && typeof content === 'string' && content.trim().length > 0 ? content : null;
  }, [whiteLabelParams, router.locale]);

  const shouldShowMarkdown = !!(existsWhiteLabel && markdownContent && !isLoading);

  return (
    <Stack minH={{ base: 'auto', md: '93vh' }} direction={{ md: 'row' }}>
      <Flex p="5vw 0 20px 0" flex={1} justify="center">
        <Stack spacing={10} w="full" maxW="md" padding="1.5rem 10px">
          <Box display={{ base: 'none', md: 'block' }} align="center" justify="center">
            {existsWhiteLabel ? (
              <Image
                src={logoData.logo_url}
                width={200}
                height={200}
                style={{
                  maxHeight: '200px',
                  minHeight: '200px',
                  objectFit: 'contain',
                }}
                alt={logoData?.name ? `${logoData.name} logo` : '4Geeks logo'}
              />
            ) : (
              <Icon icon="logoModern" width="200px" height="100px" />
            )}
          </Box>

          <Login />
        </Stack>
      </Flex>
      <Flex
        flex={1}
        display={{
          base: 'none',
          sm: 'none',
          md: 'none',
          lg: 'block',
          xl: 'block',
        }}
      >
        {shouldShowMarkdown ? (
          <Box
            height="100%"
            width="100%"
            overflowY="auto"
            padding="2rem"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            className="markdown-body"
          >
            <Box maxWidth="600px" width="100%">
              <MarkDownParser content={markdownContent} />
            </Box>
          </Box>
        ) : (
          <Image
            height="100%"
            width="100%"
            objectFit="cover"
            src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1352&q=80"
          />
        )}
      </Flex>
    </Stack>
  );
}

LoginView.propTypes = {
  existsWhiteLabel: PropTypes.bool,
};
LoginView.defaultProps = {
  existsWhiteLabel: false,
};

export default LoginView;

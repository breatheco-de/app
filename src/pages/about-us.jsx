import { Box, useColorMode, useColorModeValue } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import getT from 'next-translate/getT';
import Link from '../common/components/NextChakraLink';
import getMarkDownContent from '../common/components/MarkDownParser/markdown';
import MarkDownParser from '../common/components/MarkDownParser';
import GridContainer from '../common/components/GridContainer';
import UpgradeAccessModal from '../common/components/UpgradeAccessModal';

export const getStaticProps = async ({ locale, locales }) => {
  const t = await getT(locale, 'about-us');
  const keywords = t('seo.keywords', {}, { returnObjects: true });
  const image = t('seo.image', { domain: process.env.WEBSITE_URL || 'https://4geeks.com' });
  const ogUrl = {
    en: '/about-us',
    us: '/about-us',
  };
  const fileLanguage = {
    en: 'ABOUT.md',
    es: 'ABOUT.es.md',
  };
  const results = await fetch(
    `https://raw.githubusercontent.com/breatheco-de/app/main/${fileLanguage[locale]}`,
  )
    .then((res) => res.text())
    .catch((err) => console.error(err));

  const markdownContent = getMarkDownContent(results);
  return {
    props: {
      seo: {
        title: t('seo.title'),
        description: t('seo.description'),
        locales,
        locale,
        image,
        url: ogUrl.en || `/${locale}/about-us`,
        pathConnector: '/about-us',
        keywords,
      },
      fallback: false,
      data: markdownContent.content,
    },
  };
};

const AboutUs = ({ data }) => {
  const { colorMode } = useColorMode();
  const { t } = useTranslation(['common']);

  return (
    <GridContainer
      height="100%"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      padding="35px 0 0 0"
      // margin={{ base: '0', md: '0 10% 0 10%' }}
    >
      <Link
        href="/"
        display="inline-block"
        padding={{ base: '0px 10px 15px 10px', md: '0' }}
        w="auto"
        borderRadius="15px"
        color="blue.default"
      >
        {`← ${t('common:backToHome')}`}
      </Link>

      <Box
        display="grid"
        flexDirection="column"
        alignItems="center"
        gridTemplateColumns={{
          base: '.5fr repeat(12, 1fr) .5fr',
          md: '1.5fr repeat(12, 1fr) 1.5fr',
        }}
        flex="1"
        margin="4% 0 0 0"
        // margin={{ base: '0', md: '4% 10% 0 10%' }}
      >
        <Box
          display="grid"
          gridColumn="2 / span 12"
          padding="28px 32px"
          borderRadius="3px"
          background={useColorModeValue('#F2F6FA', 'featuredDark')}
          width="100%"
          className={`markdown-body ${colorMode === 'light' ? 'light' : 'dark'}`}
          transition="background .2s ease"
        >
          <MarkDownParser content={data} />
        </Box>
      </Box>
      <UpgradeAccessModal open />
    </GridContainer>
  );
};

AboutUs.propTypes = {
  data: PropTypes.string.isRequired,
};

export default AboutUs;

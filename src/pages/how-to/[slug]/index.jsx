/* eslint-disable no-continue */
import { useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import {
  Box, toast, useColorModeValue,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { languageLabel } from '../../../utils';
import MarkDownParser from '../../../common/components/MarkDownParser';
import getMarkDownContent from '../../../common/components/MarkDownParser/markdown';
import { MDSkeleton } from '../../../common/components/Skeleton';
import TitleContent from '../../../js_modules/projects/TitleContent';

export const getStaticPaths = async ({ locales }) => {
  const data = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset?type=ARTICLE`)
    .then((res) => res.json())
    .catch((err) => console.log(err));

  const paths = data.flatMap((res) => locales.map((locale) => ({
    params: {
      slug: res.slug,
    },
    locale,
  })));
  return {
    fallback: false,
    paths,
  };
};
export const getStaticProps = async ({ params }) => {
  const { slug } = params;
  const data = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}?type=ARTICLE`)
    .then((res) => res.json())
    .catch((err) => ({
      status: err.response.status,
    }));

  const markdown = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}.md`)
    .then((res) => res.text())
    .catch((err) => ({
      status: err.response.status,
    }));

  if (data.status === 404) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      fallback: false,
      data,
      markdown,
    },
  };
};

export default function HowToSlug({ data, markdown }) {
  const { t } = useTranslation('how-to');
  const router = useRouter();
  const language = router.locale === 'en' ? 'us' : 'es';
  const { slug } = router.query;
  const currentLanguageLabel = languageLabel[language] || language;
  console.log(`HowToSlug: ${data}`);
  const markdownData = getMarkDownContent(markdown);

  useEffect(() => {
    axios.get(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}?type=exercise`)
      .then((res) => {
        let currentlocaleLang = res.data.translations[language];
        if (currentlocaleLang === undefined) currentlocaleLang = `${slug}-${language}`;
        axios.get(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${currentlocaleLang}?asset_type=EXERCISE`)
          .catch(() => {
            toast({
              title: t('alert-message:language-not-found', { currentLanguageLabel }),
              status: 'warning',
              duration: 5500,
              isClosable: true,
            });
          });
      });
  }, [language]);

  return (
    <Box
      gridGap="20px"
      padding={{ base: '3% 4% 4% 4%', md: '1.5% 10% 1.5% 10%' }}
      borderBottom={1}
      borderStyle="solid"
      borderColor={useColorModeValue('gray.200', 'gray.900')}
    >
      <TitleContent title={t('title')} icon="document" mobile={false} />
      {/* <Search placeholder={t('search')} /> */}
      <Box
        padding={{ base: '28px 14px', md: '28px 32px' }}
        borderRadius="3px"
        background={useColorModeValue('#F2F6FA', 'featuredDark')}
        maxWidth="1012px"
        flexGrow={1}
        // margin="0 8vw 4rem 8vw"
        // width={{ base: '34rem', md: '54rem' }}
        className={`markdown-body ${useColorModeValue('light', 'dark')}`}
      >
        {markdown ? (
          <MarkDownParser content={markdownData.content} />
          // <MarkDownParser content={removeTitleAndImage(MDecoded)} />
        ) : (
          <MDSkeleton />
        )}
      </Box>

    </Box>
  );
}

HowToSlug.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  markdown: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
};

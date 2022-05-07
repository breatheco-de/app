/* eslint-disable no-continue */
import { useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import {
  Box, toast, useColorModeValue, Image,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { languageLabel } from '../../../utils';
import Link from '../../../common/components/NextChakraLink';
import MarkDownParser from '../../../common/components/MarkDownParser';
import getMarkDownContent from '../../../common/components/MarkDownParser/markdown';
import { MDSkeleton } from '../../../common/components/Skeleton';
import Heading from '../../../common/components/Heading';
import Text from '../../../common/components/Text';

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
  const { title, author, preview } = data;
  const defaultImage = '/static/images/coding-notebook.png';
  const getImage = preview || defaultImage;
  const router = useRouter();
  const language = router.locale === 'en' ? 'us' : 'es';
  const { slug } = router.query;
  const currentLanguageLabel = languageLabel[language] || language;
  const markdownData = getMarkDownContent(markdown);

  useEffect(() => {
    axios.get(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}?type=ARTICLE`)
      .then((res) => {
        let currentlocaleLang = res.data.translations[language];
        if (currentlocaleLang === undefined) currentlocaleLang = `${slug}-${language}`;
        axios.get(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${currentlocaleLang}?asset_type=ARTICLE`)
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
    <>
      <Link
        href="/projects"
        color={useColorModeValue('blue.default', 'blue.300')}
        display="inline-block"
        letterSpacing="0.05em"
        fontWeight="700"
        paddingBottom="10px"
        margin={{ base: '2% 4% 0 4%', lg: '2% 10% 0 10%' }}
      >
        {`← ${t('back-to')}`}
      </Link>
      <Box
        gridGap="20px"
        maxWidth="1012px"
        margin="0 auto"
        padding="3% 4% 4% 4%"
        borderBottom={1}
        borderStyle="solid"
        borderColor={useColorModeValue('gray.200', 'gray.900')}
      >
        <Heading size="l" fontWeight="700">
          {title}
        </Heading>
        <Box margin="24px 0 0 0">
          <Text size="l" fontWeight="900" textTransform="uppercase">
            {t('written-by')}
          </Text>
          <Text fontSize="l">
            {`${author.first_name} ${author.last_name}`}
          </Text>
        </Box>

        <Image src={getImage} alt={title} margin="20px 0 30px 0" width="100%" borderRadius="10px" height="100%" style={{ aspectRatio: '12/6' }} />
        <Box
          borderRadius="3px"
          margin="0 auto"
          maxWidth="1012px"
          flexGrow={1}
          className={`markdown-body ${useColorModeValue('light', 'dark')}`}
        >
          {markdown ? (
            <MarkDownParser content={markdownData.content} />
          ) : (
            <MDSkeleton />
          )}
        </Box>

      </Box>
    </>
  );
}

HowToSlug.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  markdown: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
};

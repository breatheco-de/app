/* eslint-disable no-param-reassign */
import { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import axios from 'axios';
import {
  Box, useColorModeValue, useToast, Modal, Button, Tooltip,
  ModalOverlay, ModalContent, ModalCloseButton,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import getT from 'next-translate/getT';
import Icon from '../../common/components/Icon';
import { languageLabel, getExtensionName } from '../../utils';
import Heading from '../../common/components/Heading';
import Link from '../../common/components/NextChakraLink';
import MarkDownParser from '../../common/components/MarkDownParser';
import TagCapsule from '../../common/components/TagCapsule';
import getMarkDownContent from '../../common/components/MarkDownParser/markdown';

export const getStaticPaths = async ({ locales }) => {
  let lessons = [];
  const data = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset?type=lesson`)
    .then((res) => res.json())
    .catch((err) => console.log(err));

  lessons = Object.values(data);
  if (data.status >= 200 && data.status < 400) {
    data.asset_type = 'lesson';
    console.log(`Original lessons: ${lessons}`);
  } else {
    console.error(`Error fetching lessons with ${data.status}`);
  }
  const paths = lessons.flatMap((res) => locales.map((locale) => {
    const localeToUsEs = locale === 'en' ? 'us' : 'es';
    return ({
      params: {
        slug: res.translations[localeToUsEs] || res.slug,
      },
      locale,
    });
  }));

  return {
    fallback: false,
    paths,
  };
};

export const getStaticProps = async ({ params, locale, locales }) => {
  const t = await getT(locale, 'lesson');
  const { slug } = params;
  const staticImage = t('seo.image', { domain: process.env.WEBSITE_URL || 'https://4geeks.com' });

  const lesson = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}`)
    .then((res) => res.json())
    .catch((err) => console.log(err));

  const { title, description, translations } = lesson;

  const exensionName = getExtensionName(lesson.readme_url);
  let markdown = '';
  let ipynbHtmlUrl = '';

  if (exensionName !== 'ipynb') {
    markdown = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}.md`)
      .then((res) => res.text())
      .catch((err) => ({
        status: err.response.status,
      }));
  } else {
    ipynbHtmlUrl = `${process.env.BREATHECODE_HOST}/v1/registry/asset/preview/${slug}`;
  }

  // const markdown = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}.md`)
  //   .then((res) => res.text())
  //   .catch((err) => ({
  //     status: err.response.status,
  //   }));

  // in "lesson.translations" rename "us" key to "en" key if exists
  if (lesson.translations.us) {
    lesson.translations.en = lesson.translations.us;
    delete lesson.translations.us;
  }

  if (lesson.status_code === 404) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      seo: {
        title,
        description,
        image: lesson.preview || staticImage,
        pathConnector: '/lesson',
        url: `/${locale}/lesson/${slug}`,
        type: 'article',
        card: 'large',
        translations,
        locales,
        locale,
        keywords: lesson.seo_keywords,
        publishedTime: lesson.created_at,
        modifiedTime: lesson.updated_at,
      },
      fallback: false,
      lesson,
      markdown,
      ipynbHtmlUrl,
      // translations: lesson.translations,
    },
  };
};

const LessonSlug = ({ lesson, markdown, ipynbHtmlUrl }) => {
  const { t } = useTranslation('lesson');
  // const [readme, setReadme] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  // getMarkDownContent(markdown);
  const markdownData = getMarkDownContent(markdown);

  const router = useRouter();
  const toast = useToast();
  const currentTheme = useColorModeValue('light', 'dark');
  const iconColorTheme = useColorModeValue('#000000', '#ffffff');
  const language = router.locale === 'en' ? 'us' : 'es';
  const { slug } = router.query;
  const currentLanguageLabel = languageLabel[language] || language;

  useEffect(() => {
    if (ipynbHtmlUrl === '') {
      axios.get(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}?type=lesson`)
        .then(({ data }) => {
          let currentlocaleLang = data.translations[language];
          if (currentlocaleLang === undefined) currentlocaleLang = `${slug}-${language}`;
          axios.get(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${currentlocaleLang}?asset_type=LESSON`)
            .catch(() => {
              toast({
                title: t('alert-message:language-not-found', { currentLanguageLabel }),
                status: 'warning',
                duration: 5500,
                isClosable: true,
              });
            });
        });
    }
  }, [language]);

  const EventIfNotFound = () => {
    toast({
      title: t('alert-message:content-not-found2', { lesson: t('common:lesson') }),
      // description: 'Content not found',
      status: 'error',
      duration: 7000,
      isClosable: true,
    });
  };

  useEffect(() => {
    if (typeof markdown !== 'string') {
      setTimeout(() => {
        EventIfNotFound();
      }, 4000);
    }
  }, [markdown]);

  return (
    <Box
      height="100%"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      margin={{ base: '4rem 4% 0 4%', md: '4% 14% 0 14%' }}
    >
      <Box flex="1" margin={{ base: '28px 0', md: '28px 14% 0 14%' }}>
        <Box display="flex" gridGap="10px" justifyContent="space-between">
          <TagCapsule
            variant="rounded"
            tags={lesson.technologies}
            marginY="8px"
            fontSize="13px"
            style={{
              padding: '2px 10px',
              margin: '0',
            }}
            gap="10px"
            paddingX="0"
          />
          <Link href={lesson.readme_url} width="fit-content" color="gray.400" target="_blank" rel="noopener noreferrer" display="flex" justifyContent="right" gridGap="12px" alignItems="center">
            <Icon icon="pencil" color="#A0AEC0" width="20px" height="20px" />
            {t('common:edit-on-github')}
          </Link>
        </Box>
        <Heading
          as="h1"
          size="30px"
          fontWeight="700"
          margin="22px 0 35px 0"
          transition="color 0.2s ease-in-out"
          color={useColorModeValue('black', 'white')}
          textTransform="uppercase"
        >
          {lesson.title}
        </Heading>

        {markdown && ipynbHtmlUrl === '' && (
          <Box
            transition="all 0.2s ease-in-out"
            borderRadius="3px"
            background={useColorModeValue('white', 'dark')}
            width={{ base: '100%', md: 'auto' }}
            // useColorModeValue('blue.default', 'blue.300')
            // colorMode === 'light' ? 'light' : 'dark'
            className={`markdown-body ${useColorModeValue('light', 'dark')}`}
          >
            <MarkDownParser content={markdownData.content} />
            {/* {(markdown && ipynbHtmlUrl === '')
              ? <MarkDownParser content={markdownData.content} />
              : <MDSkeleton />} */}

          </Box>

        )}
      </Box>
      {ipynbHtmlUrl && markdown === '' && (
        <Box width="100%" height="100%">
          <Button
            background={currentTheme}
            position="absolute"
            margin="1rem 0 0 2rem"
            padding="5px"
            height="auto"
            // _hover={{
            //   background: 'transparent',
            // }}
            onClick={() => setIsFullScreen(true)}
          >
            <Tooltip label={t('common:full-screen')} placement="top">
              <Box>
                <Icon icon="screen" color={iconColorTheme} width="22px" height="22px" />
              </Box>
            </Tooltip>
          </Button>
          <iframe
            id="iframe"
            src={`${ipynbHtmlUrl}?theme=${currentTheme}&plain=true`}
            // scrolling="no"
            seamless
            style={{
              width: '100%',
              // height: '6200rem',
              height: '80vh',
              maxHeight: '100%',
              // borderRadius: '14px',
            }}
            title={`${lesson.title} IPython Notebook`}
          />

          <Modal isOpen={isFullScreen} closeOnOverlayClick onClose={() => setIsFullScreen(false)} isCentered size="5xl" borderRadius="0">
            <ModalOverlay />
            <ModalContent>
              <ModalCloseButton
                style={{
                  top: '9px',
                  right: '18px',
                  zIndex: '99',
                }}
              />
              <iframe
                id="iframe"
                src={`${ipynbHtmlUrl}?theme=${currentTheme}&plain=true`}
                seamless
                style={{
                  width: '100%',
                  // height: '6200rem',
                  height: '100vh',
                  maxHeight: '100%',
                  // borderRadius: '14px',
                }}
                title={`${lesson.title} IPython Notebook`}
              />
            </ModalContent>
          </Modal>
        </Box>
      )}
    </Box>
  );
};

LessonSlug.propTypes = {
  lesson: PropTypes.objectOf(PropTypes.any).isRequired,
  markdown: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  ipynbHtmlUrl: PropTypes.string.isRequired,
};

export default LessonSlug;

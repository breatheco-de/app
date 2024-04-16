/* eslint-disable no-param-reassign */
/* eslint-disable react/no-array-index-key */
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  useColorModeValue,
  Button,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  Tooltip,
  Modal,
} from '@chakra-ui/react';
import { ChevronRightIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import Head from 'next/head';
import { nestAssignments } from '../../../../common/hooks/useModuleHandler';
import useStyle from '../../../../common/hooks/useStyle';
import bc from '../../../../common/services/breathecode';
import Heading from '../../../../common/components/Heading';
import Text from '../../../../common/components/Text';
import Link from '../../../../common/components/NextChakraLink';
import Icon from '../../../../common/components/Icon';
import { cleanObject, getExtensionName } from '../../../../utils';
import { ORIGIN_HOST, WHITE_LABEL_ACADEMY } from '../../../../utils/variables';
import MarkDownParser from '../../../../common/components/MarkDownParser';
import getMarkDownContent from '../../../../common/components/MarkDownParser/markdown';
import GridContainer from '../../../../common/components/GridContainer';
import IpynbHtmlParser from '../../../../common/components/IpynbHtmlParser';
import { MDSkeleton } from '../../../../common/components/Skeleton';
import modifyEnv from '../../../../../modifyEnv';
import Helmet from '../../../../common/components/Helmet';

const redirectLang = {
  es: '/es/',
  en: '/',
};

const langsDict = {
  es: 'es',
  en: 'us',
  us: 'us',
};

const formatSyllabus = (syllabus) => syllabus.json.days.filter((assignment) => {
  const {
    lessons, replits, assignments, quizzes,
  } = assignment;
  if (lessons.length > 0 || replits.length > 0 || assignments.length > 0 || quizzes.length > 0) return true;
  return false;
}).map((assignment) => {
  const {
    id, label, lessons, replits, assignments, quizzes,
  } = assignment;
  const nestedAssignments = nestAssignments({
    id,
    read: lessons,
    practice: replits,
    project: assignments,
    answer: quizzes,
  });

  const myModule = {
    id,
    label,
    modules: nestedAssignments.modules,
  };
  return myModule;
});

export const getStaticPaths = async ({ locales }) => {
  const { data } = await bc.syllabus({ is_documentation: 'True', version: 1, academy: WHITE_LABEL_ACADEMY }).getPublicVersion();

  const formatedData = data.flatMap((syllabus) => {
    const formated = formatSyllabus(syllabus);
    const assets = formated.flatMap((elem) => elem.modules.map((module) => module));
    return assets.map((asset) => ({ ...asset, syllabus }));
  });
  const paths = formatedData.flatMap((res) => locales.map((locale) => ({
    params: {
      syllabusSlug: res.syllabus.slug,
      assetSlug: res.translations?.[langsDict[locale]]?.slug || res.slug,
    },
    locale,
  })));

  return {
    fallback: false,
    paths,
  };
};

export const getStaticProps = async ({ params, locale }) => {
  const { syllabusSlug, assetSlug } = params;

  try {
    const result = await bc.syllabus({ is_documentation: 'True', version: 1, academy: WHITE_LABEL_ACADEMY, slug: syllabusSlug }).getPublicVersion();
    const syllabus = result.data.find((syll) => syll.slug === syllabusSlug);
    if (!syllabus) throw new Error('syllabus not found');

    const moduleData = formatSyllabus(syllabus);

    const asset = moduleData.flatMap((syllabusModule) => syllabusModule.modules.map((moduleAsset) => moduleAsset))
      .find((moduleAsset) => moduleAsset.slug === assetSlug || moduleAsset.translations?.[locale]?.slug === assetSlug);

    const { translations } = asset;

    const translationArray = [
      {
        value: 'us',
        lang: 'en',
        slug: translations?.us?.slug,
        link: `/docs/${syllabusSlug}/${translations?.us?.slug}`,
      },
      {
        value: 'en',
        lang: 'en',
        slug: translations?.en,
        link: `/docs/${syllabusSlug}/${translations?.en?.slug}`,
      },
      {
        value: 'es',
        lang: 'es',
        slug: translations?.es?.slug,
        link: `/es/docs/${syllabusSlug}/${translations?.es?.slug}`,
      },
    ].filter((item) => translations && translations?.[item?.value] !== undefined);

    //serialize moduleData removing undefined values
    moduleData.forEach((moduleSyllabus) => {
      moduleSyllabus.modules.forEach((mod) => {
        Object.keys(mod).forEach((key) => {
          if (mod[key] === undefined) mod[key] = null;
        });
      });
    });
    return {
      props: {
        seo: {
          disableDynamicGeneration: true,
        },
        translations: translationArray,
        syllabusData: syllabus,
        moduleMap: moduleData,
      },
    };
  } catch (error) {
    console.error(`Error fetching page for /${locale}/docs/${syllabusSlug}/${assetSlug}`, error);
    return {
      notFound: true,
    };
  }
};

function Docs({ syllabusData, moduleMap }) {
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  const router = useRouter();
  const { syllabusSlug, assetSlug } = router.query;
  const { t, lang } = useTranslation('docs');
  const currentLang = langsDict[lang];
  const [asset, setAsset] = useState(null);
  const [open, setOpen] = useState(null);
  const [loadStatus, setLoadStatus] = useState({
    loading: true,
    status: 'loading',
  });
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { hexColor, borderColor, featuredLight, fontColor } = useStyle();
  const currentTheme = useColorModeValue('light', 'dark');

  const markdownData = asset?.markdown ? getMarkDownContent(asset.markdown) : '';
  const isIpynb = asset?.ipynbHtml?.statusText === 'OK' || asset?.ipynbHtml?.iframe;
  const langPrefix = lang === 'en' ? '' : `/${lang}`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    name: asset?.title,
    description: asset?.description,
    url: `${ORIGIN_HOST}${langPrefix}/docs/${syllabusSlug}/${assetSlug}`,
    image: asset?.preview || `${ORIGIN_HOST}/static/images/4geeks.png`,
    datePublished: asset?.published_at,
    dateModified: asset?.updated_at,
    author: asset?.author ? {
      '@type': 'Person',
      name: `${asset?.author?.first_name} ${asset?.author?.last_name}`,
    } : null,
    keywords: asset?.seo_keywords,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${ORIGIN_HOST}${langPrefix}/docs/${syllabusSlug}/${assetSlug}`,
    },
  };
  const cleanedStructuredData = cleanObject(structuredData);

  const getAssetData = async () => {
    try {
      const isInSyllabus = moduleMap.some((myModule) => myModule.modules.some((moduleAsset) => {
        if (moduleAsset.slug === assetSlug) return true;
        const translations = moduleAsset.translations ? Object.values(moduleAsset.translations) : [];
        return translations.some((translation) => translation.slug === assetSlug);
      }));
      if (!isInSyllabus) throw new Error('this asset is not part of this syllabus');
      const response = await fetch(`${BREATHECODE_HOST}/v1/registry/asset/${assetSlug}`);
      const assetData = await response.json();
      const { translations = {} } = assetData;

      const urlPathname = assetData?.readme_url ? assetData?.readme_url.split('https://github.com')[1] : null;
      const pathnameWithoutExtension = urlPathname ? urlPathname.split('.ipynb')[0] : null;
      const extension = urlPathname ? urlPathname.split('.').pop() : null;
      const translatedExtension = (assetData?.lang === 'us' || assetData?.lang === null) ? '' : `.${assetData?.lang}`;
      const finalPathname = `https://colab.research.google.com/github${pathnameWithoutExtension}${translatedExtension}.${extension}`;

      const exensionName = getExtensionName(assetData.readme_url);
      let markdown = '';
      let ipynbHtml = '';
      const translationInEnglish = translations?.en || translations?.us;
      const translationArray = [
        {
          value: 'en',
          lang: 'en',
          slug: (assetData?.lang === 'en' || assetData?.lang === 'us') ? assetData?.slug : translationInEnglish,
          link: `/docs/${syllabusSlug}/${(assetData?.lang === 'en' || assetData?.lang === 'us') ? assetData?.slug : translationInEnglish}`,
        },
        {
          value: 'es',
          lang: 'es',
          slug: assetData?.lang === 'es' ? assetData.slug : translations?.es,
          link: `/es/docs/${syllabusSlug}/${assetData?.lang === 'es' ? assetData.slug : translations?.es}`,
        },
      ].filter((item) => item?.slug !== undefined);

      if (exensionName !== 'ipynb') {
        const resp = await fetch(`${BREATHECODE_HOST}/v1/registry/asset/${assetSlug}.md`);
        if (resp.status >= 400) {
          throw new Error('markdown not found');
        }
        markdown = await resp.text();
      } else {
        const ipynbIframe = `${BREATHECODE_HOST}/v1/registry/asset/preview/${assetSlug}`;
        const ipynbHtmlUrl = `${BREATHECODE_HOST}/v1/registry/asset/${assetSlug}.html`;
        const resp = await fetch(ipynbHtmlUrl);

        ipynbHtml = {
          html: await resp.text(),
          iframe: ipynbIframe,
          statusText: resp.statusText,
          status: resp.status,
        };
      }

      setAsset({
        ...assetData,
        markdown,
        ipynbHtml,
        collab_url: finalPathname,
        translationArray,
      });
      setLoadStatus({
        loading: false,
        status: 'done',
      });
    } catch (e) {
      setLoadStatus({
        loading: false,
        status: '',
      });
      console.log(e);
    }
  };

  useEffect(() => {
    moduleMap.forEach((syllabusModule, i) => {
      if (syllabusModule.modules.find((elem) => elem.slug === assetSlug || elem.translations?.[langsDict[lang]]?.slug === assetSlug)) setOpen(i);
    });
  }, []);

  useEffect(() => {
    if (moduleMap.length > 0 && assetSlug) getAssetData();
  }, [assetSlug, moduleMap]);

  const handleOpen = (index) => (index === open ? setOpen(null) : setOpen(index));

  const getPrevArticle = () => {
    if (Number.isNaN(open)) return null;
    const currentIndex = moduleMap[open]?.modules.findIndex((elem) => elem.slug === assetSlug);
    const nextAsset = moduleMap[open]?.modules[currentIndex - 1];
    if (nextAsset) return nextAsset;
    const prevModule = moduleMap[open - 1];
    if (prevModule && prevModule.modules.length > 0) return prevModule.modules[prevModule.modules.length - 1];
    return null;
  };

  const getNextArticle = () => {
    if (Number.isNaN(open)) return null;
    const currentIndex = moduleMap[open]?.modules.findIndex((elem) => elem.slug === assetSlug);
    const nextAsset = moduleMap[open]?.modules[currentIndex + 1];
    if (nextAsset) return nextAsset;
    const nextModule = moduleMap[open + 1];
    if (nextModule && nextModule.modules.length > 0) return nextModule.modules[0];
    return null;
  };

  const prevArticle = getPrevArticle();
  const nextArticle = getNextArticle();

  return (
    <>
      {cleanedStructuredData?.name && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanedStructuredData) }}
          />
        </Head>
      )}
      <Helmet
        title={asset?.title || ''}
        description={asset?.description || ''}
        image={asset?.preview || ''}
        pathConnector={`/docs/${syllabusSlug}`}
        url={`/docs/${syllabusSlug}/${assetSlug}`}
        slug={assetSlug || ''}
        type="article"
        locales={router.locales}
        locale={lang}
        publishedTime={asset?.published_at || ''}
        modifiedTime={asset?.last_synch_at || ''}
        translations={asset?.translationArray}
      />
      {!loadStatus.loading && loadStatus.status === 'not-found' && (
        <Box height="50vh">
          <Heading textAlign="center" size="l" as="h1" fontWeight="700" margin="2rem">
            {t('not-found')}
          </Heading>
        </Box>
      )}
      <GridContainer
        maxWidth="1228px"
        margin="28px auto 0 auto"
        height="100%"
        gridTemplateColumns="4fr repeat(12, 1fr)"
        gridGap="36px"
        padding="0 10px"
      >
        <Box gridColumn="1 / span 1">
          <Heading size="sm">{syllabusData?.name}</Heading>
          <Box>
            {moduleMap.map((module, index) => (
              <Box marginTop="30px" key={`${module.label}-${index}`} borderBottom="1px solid" borderColor={hexColor.featuredColor}>
                <Box display="flex" alignItems="center" cursor="pointer" onClick={() => handleOpen(index)}>
                  <Text size="md" color={hexColor.fontColor3} fontWeight="700">
                    {typeof module.label === 'string' ? module.label : module.label[currentLang]}
                  </Text>
                  {open === index ? (
                    <ChevronDownIcon color={hexColor.blueDefault} />
                  ) : (
                    <ChevronRightIcon color={hexColor.blueDefault} />
                  )}
                </Box>
                {open === index && (
                  <Box marginLeft="5px">
                    {module.modules.map((assetModule, i) => {
                      const assetData = assetModule.translations?.[langsDict[lang]] || assetModule;
                      return (
                        <Box margin="5px 0" padding="15px" borderLeft="2px solid" borderColor={assetSlug === assetData.slug ? hexColor.blueDefault : borderColor} key={`${assetData.slug}-${i}`}>
                          <Link
                            color={hexColor.fontColor3}
                            href={`${redirectLang[lang]}docs/${syllabusSlug}/${assetData.slug}`}
                            textDecoration="none"
                            _hover={{
                              textDecoration: 'none',
                            }}
                            style={{ fontSize: '14px' }}
                          >
                            {assetData.title}
                          </Link>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>
        <Box gridColumn="2 / span 12" maxWidth="854px">
          <Box display="grid" gridColumn="2 / span 12">
            <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} margin={{ base: '1.5rem 0', md: '0 0 1rem 0' }} gridGap="10px" justifyContent="space-between" position="relative">
              <Box display={{ base: 'flex', md: 'block' }} margin={{ base: '0 0 1rem 0', md: '0px' }} position={{ base: 'static', md: 'absolute' }} width={{ base: '100%', md: '172px' }} height="auto" top="0px" right="32px" background={featuredLight} borderRadius="4px" color={fontColor}>
                {asset?.readme_url && (
                  <Link display="flex" target="_blank" rel="noopener noreferrer" width="100%" gridGap="8px" padding={{ base: '8px 12px', md: '8px' }} background="transparent" href={`${asset?.readme_url}`} _hover={{ opacity: 0.7 }} style={{ color: fontColor, textDecoration: 'none' }}>
                    <Icon icon="pencil" color="#A0AEC0" width="20px" height="20px" />
                    {t('common:edit-on-github')}
                  </Link>
                )}

                {isIpynb && asset?.collab_url && asset?.readme_url && (
                  <Box width={{ base: '1px', md: '100%' }} height={{ base: 'auto', md: '1px' }} background={borderColor} />
                )}

                {isIpynb && asset?.collab_url && asset?.readme_url && (
                  <Link display="flex" target="_blank" rel="noopener noreferrer" width="100%" gridGap="8px" padding={{ base: '8px 12px', md: '8px' }} background="transparent" color="white" href={asset?.collab_url} _hover={{ opacity: 0.7 }} style={{ color: fontColor, textDecoration: 'none' }}>
                    <Icon icon="collab" color="#A0AEC0" width="28px" height="28px" />
                    {t('common:open-google-collab')}
                  </Link>
                )}
              </Box>

            </Box>
          </Box>
          {asset?.title && (
            <Heading size="l" as="h1" fontWeight="700" margin="0rem 0 2rem 0">
              {asset.title}
            </Heading>
          )}

          {loadStatus.loading && (
            <MDSkeleton />
          )}

          {asset?.markdown && !isIpynb && (
            <Box
              margin="0 auto"
              // display="grid"
              gridColumn="2 / span 12"
              transition="background 0.2s ease-in-out"
              borderRadius="3px"
              maxWidth="1280px"
              background={useColorModeValue('white', 'dark')}
              width={{ base: '100%', md: 'auto' }}
              className={`markdown-body ${useColorModeValue('light', 'dark')}`}
            >
              <MarkDownParser content={markdownData.content} withToc isPublic />
            </Box>
          )}

          {isIpynb && asset?.markdown === '' && asset?.ipynbHtml?.html && (
            <Box
              height="100%"
              gridColumn="2 / span 12"
              borderRadius="3px"
              maxWidth="1280px"
              width={{ base: '100%', md: 'auto' }}
            >
              {asset?.ipynbHtml.status > 400 ? (
                <Box>
                  <Button
                    background={currentTheme}
                    position="absolute"
                    margin="1rem 0 0 2rem"
                    padding="5px"
                    height="auto"
                    onClick={() => setIsFullScreen(true)}
                  >
                    <Tooltip label={t('common:full-screen')} placement="top">
                      <Box>
                        <Icon icon="screen" color="#000" width="22px" height="22px" />
                      </Box>
                    </Tooltip>
                  </Button>
                  <Box display={currentTheme === 'dark' ? 'block' : 'none'}>
                    <iframe
                      id="iframe"
                      src={`${asset?.ipynbHtml.iframe}?theme=dark&plain=true`}
                      seamless
                      style={{
                        width: '100%',
                        height: '80vh',
                        maxHeight: '100%',
                      }}
                      title={`${asset.title} IPython Notebook`}
                    />
                  </Box>
                  <Box display={currentTheme === 'light' ? 'block' : 'none'}>
                    <iframe
                      id="iframe"
                      src={`${asset?.ipynbHtml.iframe}?theme=light&plain=true`}
                      seamless
                      style={{
                        width: '100%',
                        height: '80vh',
                        maxHeight: '100%',
                      }}
                      title={`${asset.title} IPython Notebook`}
                    />
                  </Box>

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
                        src={`${asset?.ipynbHtml.iframe}?theme=${currentTheme}&plain=true`}
                        seamless
                        style={{
                          width: '100%',
                          height: '100vh',
                          maxHeight: '100%',
                        }}
                        title={`${asset.title} IPython Notebook`}
                      />
                    </ModalContent>
                  </Modal>
                </Box>
              ) : (
                <Box width="100%" height="100%">
                  <IpynbHtmlParser
                    html={asset?.ipynbHtml.html}
                  />
                </Box>
              )}
            </Box>
          )}
          <Box margin="0 auto" display="flex" justifyContent="flex-end" gap="20px">
            {prevArticle && (
              <Link
                href={`/docs/${syllabusSlug}/${prevArticle.slug}`}
                fontWeight="700"
                fontSize="15px"
                variant="default"
                display="flex"
                alignItems="center"
                gridGap="10px"
                onClick={() => {
                  if (!moduleMap[open].modules.find((elem) => elem.slug === prevArticle.slug)) {
                    setOpen(open - 1);
                  }
                }}
              >
                <Icon icon="arrowLeft2" width="18px" height="10px" />
                {t('previous-article')}
              </Link>
            )}

            {nextArticle && (
              <Link
                href={`/docs/${syllabusSlug}/${nextArticle.slug}`}
                fontWeight="700"
                fontSize="15px"
                variant="default"
                display="flex"
                alignItems="center"
                gridGap="10px"
                onClick={() => {
                  if (!moduleMap[open].modules.find((elem) => elem.slug === nextArticle.slug)) {
                    setOpen(open + 1);
                  }
                }}
              >
                {t('next-article')}
                <Icon style={{ transform: 'rotate(180deg)' }} icon="arrowLeft2" width="18px" height="10px" />
              </Link>
            )}
          </Box>
        </Box>
      </GridContainer>
    </>
  );
}

Docs.propTypes = {
  syllabusData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  moduleMap: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
};

export default Docs;

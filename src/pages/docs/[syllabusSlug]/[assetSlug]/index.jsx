/* eslint-disable react/no-array-index-key */
import { useEffect, useState } from 'react';
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
import { nestAssignments } from '../../../../common/hooks/useModuleHandler';
import useStyle from '../../../../common/hooks/useStyle';
import useAuth from '../../../../common/hooks/useAuth';
import bc from '../../../../common/services/breathecode';
import Heading from '../../../../common/components/Heading';
import Text from '../../../../common/components/Text';
import Link from '../../../../common/components/NextChakraLink';
import Icon from '../../../../common/components/Icon';
import { getExtensionName } from '../../../../utils';
import MarkDownParser from '../../../../common/components/MarkDownParser';
import getMarkDownContent from '../../../../common/components/MarkDownParser/markdown';
import GridContainer from '../../../../common/components/GridContainer';
import asPrivate from '../../../../common/context/PrivateRouteWrapper';
import IpynbHtmlParser from '../../../../common/components/IpynbHtmlParser';
import { MDSkeleton } from '../../../../common/components/Skeleton';

function Docs() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [syllabusData, setSyllabusData] = useState(null);
  const [asset, setAsset] = useState(null);
  const [open, setOpen] = useState(null);
  const [moduleMap, setModuleMap] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { user } = useAuth();
  const { syllabusSlug, assetSlug } = router.query;
  const { hexColor, borderColor, featuredLight, fontColor } = useStyle();
  const currentTheme = useColorModeValue('light', 'dark');

  const academyId = user?.active_cohort?.academy_id;
  const markdownData = asset?.markdown ? getMarkDownContent(asset.markdown) : '';
  const isIpynb = asset?.ipynbHtml?.statusText === 'OK' || asset?.ipynbHtml?.iframe;

  const getSyllabusData = async () => {
    try {
      const result = await bc.syllabus().get(academyId, syllabusSlug);
      setSyllabusData(result.data);

      const moduleData = result.data.json.days.filter((assignment) => {
        const {
          lessons, replits, assignments, quizzes,
        } = assignment;
        if (lessons.length > 0 || replits.length > 0 || assignments.length > 0 || quizzes.length > 0) return true;
        return false;
      }).map((assignment, i) => {
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
        if (myModule.modules.find((elem) => elem.slug === assetSlug)) setOpen(i);
        return myModule;
      });
      setModuleMap(moduleData);
    } catch (e) {
      console.log(e);
    }
  };

  const getAssetData = async () => {
    try {
      const response = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${assetSlug}`);
      const assetData = await response.json();

      const urlPathname = assetData?.readme_url ? assetData?.readme_url.split('https://github.com')[1] : null;
      const pathnameWithoutExtension = urlPathname ? urlPathname.split('.ipynb')[0] : null;
      const extension = urlPathname ? urlPathname.split('.').pop() : null;
      const translatedExtension = (assetData?.lang === 'us' || assetData?.lang === null) ? '' : `.${assetData?.lang}`;
      const finalPathname = `https://colab.research.google.com/github${pathnameWithoutExtension}${translatedExtension}.${extension}`;

      const exensionName = getExtensionName(assetData.readme_url);
      let markdown = '';
      let ipynbHtml = '';

      if (exensionName !== 'ipynb') {
        const resp = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${assetSlug}.md`);
        if (resp.status >= 400) {
          throw new Error('markdown not found');
        }
        markdown = await resp.text();
      } else {
        const ipynbIframe = `${process.env.BREATHECODE_HOST}/v1/registry/asset/preview/${assetSlug}`;
        const ipynbHtmlUrl = `${process.env.BREATHECODE_HOST}/v1/registry/asset/${assetSlug}.html`;
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
      });
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getSyllabusData();
  }, []);

  useEffect(() => {
    getAssetData();
  }, [assetSlug]);

  const handleOpen = (index) => (index === open ? setOpen(null) : setOpen(index));

  return (
    <>
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
                    {module.label}
                  </Text>
                  {open === index ? (
                    <ChevronDownIcon color={hexColor.blueDefault} />
                  ) : (
                    <ChevronRightIcon color={hexColor.blueDefault} />
                  )}
                </Box>
                {open === index && (
                  <Box marginLeft="15px">
                    {module.modules.map((assetModule, i) => (
                      <Box display="flex" flexDirection="column" justifyContent="center" margin="5px 0" height="55px" padding="0 15px" borderLeft="2px solid" borderColor={assetSlug === assetModule.slug ? hexColor.blueDefault : borderColor} key={`${assetModule.slug}-${i}`}>
                        <Link
                          color={hexColor.fontColor3}
                          href={`/docs/${syllabusSlug}/${assetModule.slug}`}
                          textDecoration="none"
                          _hover={{
                            textDecoration: 'none',
                          }}
                        >
                          {assetModule.title}
                        </Link>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>
        <Box gridColumn="2 / span 12" maxWidth="854px">
          <Box display="grid" gridColumn="2 / span 12">
            <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} margin="0 0 1rem 0" gridGap="10px" justifyContent="space-between" position="relative">
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

          {asset?.markdown && !isIpynb ? (
            <Box
              height="100%"
              margin="0 rem auto 0 auto"
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
          ) : (
            <>
              {!isIpynb && (
                <MDSkeleton />
              )}
            </>
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
        </Box>
      </GridContainer>
    </>
  );
}

export default asPrivate(Docs);

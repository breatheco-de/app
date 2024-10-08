/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import React, { useEffect, useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkGemoji from 'remark-gemoji';
import PropTypes from 'prop-types';
import rehypeRaw from 'rehype-raw';
import {
  Img,
  Box,
  Button,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Image,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Checkbox,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import AnchorJS from 'anchor-js';
import useCohortHandler from '../../hooks/useCohortHandler';
import useStyle from '../../hooks/useStyle';
import bc from '../../services/breathecode';
import modifyEnv from '../../../../modifyEnv';
import {
  Wrapper, BeforeAfter, Code, MDCheckbox, MDHeading, MDHr, MDLink, MDText, OnlyForBanner, Quote,
} from './MDComponents';
import { usePersistent } from '../../hooks/usePersistent';
import useModuleHandler from '../../hooks/useModuleHandler';
import Toc from './toc';
import ContentHeading from './ContentHeading';
import CodeViewer, { languagesLabels, languagesNames } from '../CodeViewer';
import Heading from '../Heading';
import Text from '../Text';
import NextChakraLink from '../NextChakraLink';
import ReactPlayerV2 from '../ReactPlayerV2';
import SubTasks from './SubTasks';
import CallToAction from '../CallToAction';
import DynamicCallToAction from '../DynamicCallToAction';

function MarkdownH2Heading({ children }) {
  return (
    <MDHeading tagType="h2">
      {children}
    </MDHeading>
  );
}
function MarkdownH3Heading({ children }) {
  return (
    <MDHeading tagType="h3">
      {children}
    </MDHeading>
  );
}
function MarkdownH4Heading({ children }) {
  return (
    <MDHeading tagType="h4">
      {children}
    </MDHeading>
  );
}
function UlComponent({ children }) {
  return (<ul className="md-bullet">{children}</ul>);
}
function OlComponent({ children }) {
  return (<ol className="md-bullet">{children}</ol>);
}
function ImgComponent(props) {
  return (<Img className="MDImg" alt={props?.alt} src={props?.src} />);
}
function ParagraphComponent({ children }) {
  return (<MDText>{children}</MDText>);
}
function HrComponent() {
  return (<MDHr />);
}
function IframeComponent({ src, title, width, height }) {
  return (<iframe src={src} width={width} height={height} title={title || 'iframe-content'} className="MDIframe" />);
}
function OnlyForComponent({ profile, ...props }) {
  return (<OnlyForBanner profile={profile} {...props} />);
}

function CodeViewerComponent(props) {
  const { preParsedContent, node, fileContext } = props;
  const nodeStartOffset = node.position.start.offset;
  const nodeEndOffset = node.position.end.offset;

  const input = preParsedContent.substring(nodeStartOffset, nodeEndOffset);
  const regex = /```([a-zA-Z]+)(.*)([\s\S]+?)```/g;
  let match;
  const fragments = [];

  // eslint-disable-next-line no-cond-assign
  while ((match = regex.exec(input)) !== null) {
    const parameters = match[2].split(' ');

    let path = parameters.find((param) => param.includes('path'));
    if (path) {
      const removeQuotes = /"|'|path=/g;
      path = path.replaceAll(removeQuotes, '');
    }
    fragments.push({
      language: languagesNames[match[1].toLowerCase()] || match[1],
      label: languagesLabels[match[1].toLowerCase()] || match[1],
      code: match[3].trim(),
      path,
    });
  }

  return (
    <CodeViewer
      languagesData={fragments}
      margin="10px 0"
      fileContext={fileContext}
    />
  );
}

function MdCallToAction({ assetData }) {
  return (
    <DynamicCallToAction
      assetId={assetData?.id}
      assetTechnologies={assetData?.technologies?.map((item) => item?.slug)}
      assetType={assetData?.asset_type.toLowerCase()}
      placement="bottom"
      marginTop="40px"
    />
  );
}

function ListComponent({ subTasksLoaded, newSubTasks, setNewSubTasks, subTasks, updateSubTask, ...props }) {
  const childrenExists = props?.children?.length >= 0;
  const type = childrenExists && props?.children[0]?.props && props.children[0].props.type;
  const type2 = childrenExists && props?.children[1]?.props && props.children[1]?.props.node?.children[0]?.properties?.type;
  return (type === 'checkbox' || type2 === 'checkbox') ? (
    <MDCheckbox
      className="MDCheckbox"
      {...props}
      subTasksLoaded={subTasksLoaded}
      newSubTasks={newSubTasks}
      setNewSubTasks={setNewSubTasks}
      subTasks={subTasks}
      updateSubTask={updateSubTask}
    />
  ) : (
    <li>{props?.children}</li>
  );
}

function OpenWithLearnpackCTA({ currentAsset }) {
  const { t, lang } = useTranslation('common');
  const [learnpackActions, setLearnpackActions] = useState([]);
  const { state } = useCohortHandler();
  const { cohortSession } = state;
  const [showCloneModal, setShowCloneModal] = useState(false);
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });

  const accessToken = localStorage.getItem('accessToken');

  const provisioningLinks = [{
    title: t('learnpack.new-exercise'),
    link: `${BREATHECODE_HOST}/v1/provisioning/me/container/new?token=${accessToken}&cohort=${cohortSession?.id}&repo=${currentAsset?.url}`,
    isExternalLink: true,
  },
  {
    title: t('learnpack.continue-exercise'),
    link: `${BREATHECODE_HOST}/v1/provisioning/me/workspaces?token=${accessToken}&cohort=${cohortSession?.id}&repo=${currentAsset?.url}`,
    isExternalLink: true,
  }];

  useEffect(() => {
    const openInLearnpackAction = t('learnpack.open-in-learnpack-button', {}, { returnObjects: true });
    const localhostAction = {
      text: `${t('learnpack.open-locally')}${cohortSession?.available_as_saas ? ` (${t('learnpack.recommended')})` : ''}`,
      type: 'button',
      onClick: () => {
        setShowCloneModal(true);
      },
    };
    const cloudActions = {
      ...openInLearnpackAction,
      text: `${openInLearnpackAction.text}${cohortSession?.available_as_saas === false ? ` (${t('learnpack.recommended')})` : ''}`,
      links: provisioningLinks,
    };
    if (cohortSession?.id) {
      if (!currentAsset?.gitpod) setLearnpackActions([localhostAction]);
      else if (cohortSession.available_as_saas) setLearnpackActions([localhostAction, cloudActions]);
      else setLearnpackActions([cloudActions, localhostAction]);
    }
  }, [lang, cohortSession?.id, currentAsset?.url]);

  return (
    <>
      <CallToAction
        buttonStyle={{
          color: 'white',
        }}
        background="blue.default"
        reverseButtons={cohortSession?.available_as_saas}
        margin="12px 0 20px 0px"
        icon="learnpack"
        text={t('learnpack.description', { projectName: currentAsset?.title })}
        width={{ base: '100%', md: 'fit-content' }}
        buttonsData={learnpackActions}
        buttonsContainerStyles={{ alignSelf: 'auto' }}
      />
      <ModalToCloneProject currentAsset={currentAsset} isOpen={showCloneModal} onClose={setShowCloneModal} />
    </>
  );
}

function ModalToCloneProject({ isOpen, onClose, currentAsset }) {
  const { t } = useTranslation('syllabus');
  const { state } = useCohortHandler();
  const { cohortSession } = state;
  const [selectedOs, setSelectedOs] = useState(null);
  const [expanded, setExpanded] = useState(0);
  const { featuredLight, hexColor, borderColor } = useStyle();

  const urlToClone = currentAsset?.url || currentAsset?.readme_url.split('/blob')?.[0];
  const repoName = urlToClone.split('/').pop();

  const osList = t('common:learnpack.clone-modal.os-list', { repoUrl: urlToClone }, { returnObjects: true });
  const agentVsCode = t('common:learnpack.clone-modal.agent-vs-code', {}, { returnObjects: true });
  const agentOS = t('common:learnpack.clone-modal.agent-os', { repoName }, { returnObjects: true });

  const finalStep = currentAsset?.agent === 'vscode' ? agentVsCode : agentOS;

  const steps = selectedOs?.steps.concat([finalStep]);

  const resetSelector = () => {
    setSelectedOs(null);
    setExpanded(0);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl">
      <ModalOverlay />
      <ModalContent padding="16px" overflow="auto">
        <ModalCloseButton />
        <Box display="flex" gap="16px" height="100%" minHeight="100%">
          <Box width={{ base: '100%', md: '50%' }} display="flex" flexDirection="column" justifyContent="space-between" height="100%">
            <Box>
              <Heading size="sm" fontWeight="400">
                {t('common:learnpack.clone-modal.title')}
              </Heading>
              <Text mt="16px" size="18px">
                {t('common:learnpack.clone-modal.description')}
              </Text>
              {!selectedOs && (
                <Box padding="16px">
                  <Text fontFamily="Space Grotesk Variable" fontWeight="500" fontSize="18px">
                    {t('common:learnpack.clone-modal.select-os')}
                  </Text>
                  <Box mt="12px" display="flex" gap="12px">
                    {osList.map((os) => (
                      <Box
                        borderRadius="8px"
                        width="140px"
                        height="140px"
                        background={featuredLight}
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        cursor="pointer"
                        onClick={() => setSelectedOs(os)}
                        _active={{
                          background: hexColor.featuredColor,
                          border: '1px solid',
                          borderColor: hexColor.blueDefault,
                        }}
                      >
                        <Image src={os.logo} alt={os.label} margin="auto" />
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
              {selectedOs && (
                <Box>
                  <Button variant="link" textDecoration="none" onClick={resetSelector}>
                    ←
                    {'  '}
                    {t('common:go-back')}
                  </Button>
                  <Accordion index={expanded} onChange={(val) => setExpanded(val)} allowToggle display="flex" flexDirection="column" gap="10px">
                    {steps.map((step, i) => (
                      <AccordionItem display="flex" flexDirection="column" key={step.title} border="1px solid" borderColor={expanded === i ? 'blue.default' : borderColor} borderRadius="8px">
                        <Heading position="relative" as="h3">
                          <Checkbox top="10px" left="16px" position="absolute" />
                          <AccordionButton cursor="pointer" _expanded={{ color: ('blue.default') }}>
                            <Box marginLeft="26px" fontFamily="Space Grotesk Variable" as="span" flex="1" fontSize="18px" textAlign="left">
                              {`${i + 2}.`}
                              {'  '}
                              {step.label}
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                        </Heading>
                        <AccordionPanel>
                          <MarkDownParser
                            content={step.description}
                            showLineNumbers={false}
                          />
                          {step.source && (
                            <NextChakraLink href={step.source} target="_blank" color={hexColor.blueDefault}>
                              {t('common:learn-more')}
                            </NextChakraLink>
                          )}
                        </AccordionPanel>
                      </AccordionItem>
                    ))}

                  </Accordion>
                </Box>
              )}
            </Box>
            {cohortSession?.available_as_saas && (
              <NextChakraLink href="/choose-program" target="_blank" color={hexColor.blueDefault} textAlign="center">
                {t('common:learnpack.clone-modal.need-help')}
                {' '}
                →
              </NextChakraLink>
            )}
          </Box>
          <Box width="50%" display={{ base: 'none', md: 'block' }} paddingTop="20px">
            {selectedOs ? (
              <ReactPlayerV2
                className="react-player-border-radius"
                containerStyle={{ height: '100%' }}
                iframeStyle={{ background: 'none', borderRadius: '11px', height: '100% !important' }}
                url={steps && steps[expanded]?.video}
                height="100%"
              />
            ) : (
              <Box background={featuredLight} borderRadius="11px" width="100%" height="100%" />
            )}
          </Box>
        </Box>
      </ModalContent>
    </Modal>
  );
}

function MarkDownParser({
  content, withToc, frontMatter, titleRightSide, currentTask, currentData,
  showLineNumbers, showInlineLineNumbers, assetData, alerMessage, isGuidedExperience,
}) {
  const [subTasksLoaded, setSubTasksLoaded] = useState(false);
  const [newSubTasks, setNewSubTasks] = useState([]);
  const [fileContext, setFileContext] = useState('');
  const { subTasks, setSubTasks } = useModuleHandler();
  const [profile] = usePersistent('profile', {});

  const updateSubTask = async (taskProps) => {
    const cleanedSubTasks = subTasks.filter((task) => task.id !== taskProps.id);
    if (currentTask?.id) {
      const resp = await bc.todo().subtask().update(
        currentTask?.id,
        [
          ...cleanedSubTasks,
          taskProps,
        ],
      );
      if (resp.status >= 200 && resp.status < 400) {
        const respData = await resp.data;
        setSubTasks(respData);
      }
    }
  };

  // Prefetch subtasks
  useEffect(() => {
    if (currentTask?.id) {
      bc.todo().subtask().get(currentTask?.id)
        .then((resp) => {
          setSubTasks(resp.data);
          setSubTasksLoaded(true);
        });
    }
  }, [currentTask]);

  const createSubTasksIfNotExists = async () => {
    // const cleanedSubTasks = subTasks.filter((task) => task.id !== currentTask.id);
    if (currentTask?.id && newSubTasks.length > 0) {
      const resp = await bc.todo().subtask().update(
        currentTask?.id,
        [
          // ...cleanedSubTasks,
          ...newSubTasks,
        ],
      );
      if (resp.status >= 200 && resp.status < 400) {
        const respData = await resp.data;
        setSubTasks(respData);
      }
    }
  };

  // Create subTasks if not exists
  useEffect(() => {
    if (subTasksLoaded && subTasks.length === 0) {
      createSubTasksIfNotExists();
    }
  }, [subTasksLoaded, subTasks, newSubTasks]);

  const assetType = currentData?.asset_type;

  // const newLineBeforeCloseTag = /<\//gm;

  // const formatedContent = content.replace(newLineBeforeCloseTag, '\n$&');

  useEffect(() => {
    // initialize anchorJS when markdown content has mounted to the DOM
    const anchors = new AnchorJS();
    anchors.options = {
      placement: 'left',
      icon: '',
    };
    anchors.add('.markdown-body h1');
    anchors.add('.markdown-body h2');
    anchors.add('.markdown-body h3');
    anchors.add('.markdown-body p');
    anchors.add('.markdown-body pre');
  }, [content]);

  const preParsedContent = useMemo(() => {
    //This regex is to remove the runable empty codeblocks
    const emptyCodeRegex = /```([a-zA-Z]+).*runable=("true"|true|'true').*(\n{1,}|\s{1,}\n{1,})?```/gm;
    //This regex is to wrap all the runable codeblocks inside of a <codeviewer> tag
    const codeViewerRegex = /(```(?<language>[\w.]+).*runable=("true"|'true'|true).*(?<code>(?:.|\n)*?)```\n?)+/gm;

    const removedEmptyCodeViewers = content?.length > 0 ? content.replace(emptyCodeRegex, () => '') : '';

    const contentReplace = removedEmptyCodeViewers.replace(codeViewerRegex, (match) => `<pre><codeviewer>\n${match}</codeviewer></pre>\n`);

    const contextPathRegex = /```([a-zA-Z]+).*(path=[^\s]*).*([\s\S]+?)```/g;

    let fileMatch;
    // eslint-disable-next-line no-cond-assign
    while ((fileMatch = contextPathRegex.exec(contentReplace)) !== null) {
      const filePath = fileMatch[2].trim().replaceAll(/"|'|path=/g, '');
      const contentFile = fileMatch[3].trim();

      setFileContext((file) => `${file}File path: ${filePath}\nFile content:\n${contentFile}\n\n`);
    }

    return contentReplace;
  }, [content]);

  return (
    <>
      {!isGuidedExperience && (
        <ContentHeading
          titleRightSide={titleRightSide}
          callToAction={currentData?.interactive && (
            <OpenWithLearnpackCTA currentAsset={currentData} />
          )}
          content={frontMatter}
          currentData={currentData}
        />
      )}
      {withToc && (
        <Toc content={content} />
      )}

      {alerMessage && alerMessage}

      {Array.isArray(subTasks) && subTasks?.length > 0 && (
        <SubTasks subTasks={subTasks} assetType={assetType} />
      )}

      <ReactMarkdown
      // gemoji plugin
        remarkPlugins={[remarkGfm, remarkGemoji, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={{
          div: Wrapper,
          a: MDLink,
          code: ({ ...props }) => Code({ ...props, showLineNumbers, showInlineLineNumbers }),
          h1: MarkdownH2Heading,
          h2: MarkdownH2Heading,
          h3: MarkdownH3Heading,
          h4: MarkdownH4Heading,
          ul: UlComponent,
          ol: OlComponent,
          img: ImgComponent,
          p: ParagraphComponent,
          hr: HrComponent,
          BeforeAfter,
          'before-after': BeforeAfter,
          iframe: IframeComponent,
          // table: {
          //   component: MDTable,
          // },
          onlyfor: ({ ...props }) => OnlyForComponent({ ...props, profile }),
          codeviewer: ({ ...props }) => CodeViewerComponent({ ...props, preParsedContent, fileContext }),
          calltoaction: ({ ...props }) => MdCallToAction({ ...props, assetData }),
          // Component for list of checkbox
          // children[1].props.node.children[0].properties.type
          li: ({ ...props }) => ListComponent({ subTasksLoaded, newSubTasks, setNewSubTasks, subTasks, updateSubTask, ...props }),
          quote: Quote,
        }}
      >
        {preParsedContent}
      </ReactMarkdown>
    </>
  );
}

MarkDownParser.propTypes = {
  content: PropTypes.string,
  withToc: PropTypes.bool,
  frontMatter: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.array])),
  titleRightSide: PropTypes.node,
  currentTask: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.array])),
  currentData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.array])),
  showLineNumbers: PropTypes.bool,
  showInlineLineNumbers: PropTypes.bool,
  assetData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.object])),
  alerMessage: PropTypes.node,
  isGuidedExperience: PropTypes.bool,
};
MarkDownParser.defaultProps = {
  content: '',
  withToc: false,
  frontMatter: {},
  titleRightSide: null,
  currentTask: {},
  currentData: {},
  showLineNumbers: true,
  showInlineLineNumbers: true,
  assetData: null,
  alerMessage: null,
  isGuidedExperience: false,
};

export { ModalToCloneProject };

export default MarkDownParser;

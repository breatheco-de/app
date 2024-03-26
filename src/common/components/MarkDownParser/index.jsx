/* eslint-disable react/prop-types */
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import React, { useEffect, useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkGemoji from 'remark-gemoji';
import PropTypes from 'prop-types';
import rehypeRaw from 'rehype-raw';
import { Img } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import AnchorJS from 'anchor-js';
import bc from '../../services/breathecode';

// import { useRouter } from 'next/router';
import {
  Wrapper, BeforeAfter, Code, MDCheckbox, MDHeading, MDHr, MDLink, MDText, OnlyForBanner, Quote,
} from './MDComponents';
import { usePersistent } from '../../hooks/usePersistent';
import Toc from './toc';
import ContentHeading from './ContentHeading';
import CallToAction from '../CallToAction';
import CodeViewer, { languagesLabels, languagesNames } from '../CodeViewer';
import SubTasks from './SubTasks';
import modifyEnv from '../../../../modifyEnv';
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
function ParagraphComponent({ node, children }) {
  return (<MDText id={node?.children?.[0]?.properties?.alt}>{children}</MDText>);
}
function HrComponent() {
  return (<MDHr />);
}
function IframeComponent({ src, title, width, height }) {
  return (<iframe src={src} width={width} height={height} title={title || 'iframe-content'} className="MDIframe" />);
}
function OnlyForComponent({ cohortSession, profile, ...props }) {
  return (<OnlyForBanner cohortSession={cohortSession} profile={profile} {...props} />);
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

function ListComponent({ subTasksLoaded, subTasksProps, setSubTasksProps, subTasks, updateSubTask, ...props }) {
  const childrenExists = props?.children?.length >= 0;
  const type = childrenExists && props?.children[0]?.props && props.children[0].props.type;
  const type2 = childrenExists && props?.children[1]?.props && props.children[1]?.props.node?.children[0]?.properties?.type;
  return (type === 'checkbox' || type2 === 'checkbox') ? (
    <MDCheckbox
      className="MDCheckbox"
      {...props}
      subTasksLoaded={subTasksLoaded}
      subTasksProps={subTasksProps}
      setSubTasksProps={setSubTasksProps}
      subTasks={subTasks}
      updateSubTask={updateSubTask}
    />
  ) : (
    <li>{props?.children}</li>
  );
}

function MarkDownParser({
  content, callToActionProps, withToc, frontMatter, titleRightSide, currentTask, isPublic, currentData,
  showLineNumbers, showInlineLineNumbers, assetData,
}) {
  const { t } = useTranslation('common');
  const [subTasks, setSubTasks] = useState([]);
  const [subTasksLoaded, setSubTasksLoaded] = useState(false);
  const [subTasksProps, setSubTasksProps] = useState([]);
  const [learnpackActions, setLearnpackActions] = useState([]);
  const [fileContext, setFileContext] = useState('');
  const [cohortSession] = usePersistent('cohortSession', {});
  const [profile] = usePersistent('profile', {});
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });

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
    if (currentTask?.id && subTasksProps.length > 0) {
      const resp = await bc.todo().subtask().update(
        currentTask?.id,
        [
          // ...cleanedSubTasks,
          ...subTasksProps,
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
    createSubTasksIfNotExists();
  }, [subTasksProps]);

  const newExerciseText = t('learnpack.new-exercise');
  const continueExerciseText = t('learnpack.continue-exercise');

  const {
    token, assetSlug, assetType, gitpod,
  } = callToActionProps;

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
  useEffect(() => {
    setLearnpackActions([
      {
        text: newExerciseText,
        href: `${BREATHECODE_HOST}/v1/provisioning/me/container/new?token=${token}&cohort=${cohortSession?.id}&repo=${currentData?.url}`,
        isExternalLink: true,
      },
      {
        text: continueExerciseText,
        href: `${BREATHECODE_HOST}/v1/provisioning/me/workspaces?token=${token}&cohort=${cohortSession?.id}&repo=${currentData?.url}`,
        isExternalLink: true,
      },
    ]);
  }, [token, assetSlug, newExerciseText, continueExerciseText, currentData?.url]);

  const preParsedContent = useMemo(() => {
    //This regex is to remove the runable empty codeblocks
    const emptyCodeRegex = /```([a-zA-Z]+).*runable=("true"|true|'true').*(\n{1,}|\s{1,}\n{1,})?```/gm;
    //This regex is to wrap all the runable codeblocks inside of a <codeviewer> tag
    const codeViewerRegex = /(```(?<language>\w+).*runable=("true"|'true'|true).*(?<code>(?:.|\n)*?)```\n?)+/gm;

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
      <ContentHeading
        titleRightSide={titleRightSide}
        callToAction={gitpod === true && assetType === 'EXERCISE' && (
          <CallToAction
            styleContainer={{
              maxWidth: '800px',
            }}
            buttonStyle={{
              color: 'white',
            }}
            background="blue.default"
            margin="12px 0 20px 0px"
            imageSrc="/static/images/learnpack.png"
            text={t('learnpack.description')}
            width={{ base: '100%', md: 'fit-content' }}
            buttonsData={learnpackActions}
          />
        )}
        content={frontMatter}
      >
        {withToc && (
          <Toc content={content} />
        )}

        {Array.isArray(subTasks) && subTasks?.length > 0 && (
          <SubTasks subTasks={subTasks} assetType={assetType} />
        )}
      </ContentHeading>
      {isPublic && withToc && (
        <Toc content={content} />
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
          onlyfor: ({ ...props }) => OnlyForComponent({ ...props, cohortSession, profile }),
          codeviewer: ({ ...props }) => CodeViewerComponent({ ...props, preParsedContent, fileContext }),
          calltoaction: ({ ...props }) => MdCallToAction({ ...props, assetData }),
          // Component for list of checkbox
          // children[1].props.node.children[0].properties.type
          li: ({ ...props }) => ListComponent({ subTasksLoaded, subTasksProps, setSubTasksProps, subTasks, updateSubTask, ...props }),
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
  callToActionProps: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.array])),
  withToc: PropTypes.bool,
  frontMatter: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.array])),
  titleRightSide: PropTypes.node,
  currentTask: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.array])),
  isPublic: PropTypes.bool,
  currentData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.array])),
  showLineNumbers: PropTypes.bool,
  showInlineLineNumbers: PropTypes.bool,
  assetData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.object])),
};
MarkDownParser.defaultProps = {
  content: '',
  callToActionProps: {},
  withToc: false,
  frontMatter: {},
  titleRightSide: null,
  currentTask: {},
  isPublic: false,
  currentData: {},
  showLineNumbers: true,
  showInlineLineNumbers: true,
  assetData: null,
};

export default MarkDownParser;

/* eslint-disable react/prop-types */
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkGemoji from 'remark-gemoji';
import PropTypes from 'prop-types';
import rehypeRaw from 'rehype-raw';
import { Img } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import bc from '../../services/breathecode';

// import { useRouter } from 'next/router';
import {
  Wrapper, BeforeAfter, Code, MDCheckbox, MDHeading, MDHr, MDLink, MDText, OnlyForBanner, Quote,
} from './MDComponents';
import { usePersistent } from '../../hooks/usePersistent';
import Toc from './toc';
import ContentHeading from './ContentHeading';
import CallToAction from '../CallToAction';
import SubTasks from './SubTasks';
import modifyEnv from '../../../../modifyEnv';

function MarkdownH2Heading({ ...props }) {
  return (
    <MDHeading tagType="h2" {...props} />
  );
}
function MarkdownH3Heading({ ...props }) {
  return (
    <MDHeading tagType="h3" {...props} />
  );
}
function MarkdownH4Heading({ ...props }) {
  return (
    <MDHeading tagType="h4" {...props} />
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
function ParagraphComponent({ ...props }) {
  return (<MDText {...props} />);
}
function HrComponent({ ...props }) {
  return (<MDHr {...props} />);
}
function IframeComponent({ ...props }) {
  return (<iframe title={props.title || 'iframe-content'} className="MDIframe" {...props} />);
}
function OnlyForComponent({ cohortSession, profile, ...props }) {
  return (<OnlyForBanner cohortSession={cohortSession} profile={profile} {...props} />);
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
}) {
  const { t } = useTranslation('common');
  const [subTasks, setSubTasks] = useState([]);
  const [subTasksLoaded, setSubTasksLoaded] = useState(false);
  const [subTasksProps, setSubTasksProps] = useState([]);
  const [learnpackActions, setLearnpackActions] = useState([]);
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
          code: Code,
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
          // Component for list of checkbox
          // children[1].props.node.children[0].properties.type
          li: ({ ...props }) => ListComponent({ subTasksLoaded, subTasksProps, setSubTasksProps, subTasks, updateSubTask, ...props }),
          quote: Quote,
        }}
      >
        {content}
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
};

export default MarkDownParser;

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
  BeforeAfter, Code, MDCheckbox, MDHeading, MDHr, MDLink, MDText, OnlyForBanner,
} from './MDComponents';
import { usePersistent } from '../../hooks/usePersistent';
import Toc from './toc';
import ContentHeading from './ContentHeading';
import CallToAction from '../CallToAction';
import SubTasks from './SubTasks';
import modifyEnv from '../../../../modifyEnv';
import Quote from './Quote';

const MarkDownParser = ({
  content, callToActionProps, withToc, frontMatter, titleRightSide, currentTask, isPublic, currentData,
}) => {
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

  // Create subTasks if not exists
  useEffect(async () => {
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
      <Quote>Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it -- Brian Kernighan</Quote>
      {isPublic && withToc && (
        <Toc content={content} />
      )}

      <ReactMarkdown
      // gemoji plugin
        remarkPlugins={[remarkGfm, remarkGemoji, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={{
          a: MDLink,
          code: Code,
          h1: ({ ...props }) => <MDHeading tagType="h2" {...props} />,
          h2: ({ ...props }) => <MDHeading tagType="h2" {...props} />,
          h3: ({ ...props }) => <MDHeading tagType="h3" {...props} />,
          ul: ({ ...props }) => <ul className="md-bullet">{props.children}</ul>,
          ol: ({ ...props }) => <ol className="md-bullet">{props.children}</ol>,
          img: ({ ...props }) => <Img className="MDImg" {...props} />,
          p: ({ ...props }) => <MDText {...props} />,
          hr: ({ ...props }) => <MDHr {...props} />,
          BeforeAfter,
          'before-after': BeforeAfter,
          iframe: ({ ...props }) => <iframe title={props.title || 'iframe-content'} className="MDIframe" {...props} />,
          // table: {
          //   component: MDTable,
          // },
          onlyfor: ({ ...props }) => <OnlyForBanner cohortSession={cohortSession} profile={profile} {...props} />,
          // Component for list of checkbox
          // children[1].props.node.children[0].properties.type
          li: ({ ...props }) => {
            // eslint-disable-next-line prefer-destructuring
            const childrenExists = props?.children?.length >= 0;
            const type = childrenExists && props?.children[0]?.props && props.children[0].props.type;
            const type2 = childrenExists && props?.children[1]?.props && props.children[1]?.props.node?.children[0]?.properties?.type;
            return (type === 'checkbox' || type2 === 'checkbox') ? (
              <MDCheckbox className="MDCheckbox" {...props} subTasksLoaded={subTasksLoaded} subTasksProps={subTasksProps} setSubTasksProps={setSubTasksProps} subTasks={subTasks} updateSubTask={updateSubTask} />
            ) : (
              <li>{props?.children}</li>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </>
  );
};

MarkDownParser.propTypes = {
  content: PropTypes.string,
  callToActionProps: PropTypes.objectOf(PropTypes.any),
  withToc: PropTypes.bool,
  frontMatter: PropTypes.objectOf(PropTypes.any),
  titleRightSide: PropTypes.node,
  currentTask: PropTypes.objectOf(PropTypes.any),
  isPublic: PropTypes.bool,
  currentData: PropTypes.objectOf(PropTypes.any),
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

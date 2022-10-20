/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkGemoji from 'remark-gemoji';
import PropTypes from 'prop-types';
import rehypeRaw from 'rehype-raw';
import { Img } from '@chakra-ui/react';

import useTranslation from 'next-translate/useTranslation';
// import { useRouter } from 'next/router';
import {
  BeforeAfter, Code, MDCheckbox, MDHeading, MDHr, MDLink, MDText, OnlyForBanner,
} from './MDComponents';
import { usePersistent } from '../../hooks/usePersistent';
import Toc from './toc';
import ContentHeading from './ContentHeading';
import CallToAction from '../CallToAction';
import SubTasks from './SubTasks';

const MarkDownParser = ({
  content, callToActionProps, withToc, frontMatter, titleRightSide, subTasks, updateSubTask,
}) => {
  const { t } = useTranslation('common');
  const [learnpackActions, setLearnpackActions] = useState([]);
  const [cohortSession] = usePersistent('cohortSession', {});
  const [profile] = usePersistent('profile', {});

  const newExerciseText = t('learnpack.new-exercise');
  const continueExerciseText = t('learnpack.continue-exercise');

  const {
    token, assetSlug, assetType, gitpod,
  } = callToActionProps;

  const newLineBeforeCloseTag = /<\//gm;

  const formatedContent = content.replace(newLineBeforeCloseTag, '\n$&');

  useEffect(() => {
    setLearnpackActions([
      {
        text: newExerciseText,
        href: `${process.env.BREATHECODE_HOST}/asset/${assetSlug}?token=${token}`,
        isExternalLink: true,
      },
      {
        text: continueExerciseText,
        href: 'https://gitpod.io/workspaces',
        isExternalLink: true,
      },
    ]);
  }, [token, assetSlug, newExerciseText, continueExerciseText]);

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

        {subTasks?.length > 0 && (
          <SubTasks subTasks={subTasks} />
        )}
      </ContentHeading>
      <ReactMarkdown
      // gemoji plugin
        remarkPlugins={[remarkGfm, remarkGemoji]}
        rehypePlugins={[rehypeRaw]}
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
              <MDCheckbox className="MDCheckbox" {...props} subTasks={subTasks} updateSubTask={updateSubTask} />
            ) : (
              <li>{props?.children}</li>
            );
          },
        }}
      >
        {formatedContent}
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
  subTasks: PropTypes.arrayOf(PropTypes.any),
  updateSubTask: PropTypes.func,
};
MarkDownParser.defaultProps = {
  content: '',
  callToActionProps: {},
  withToc: false,
  frontMatter: {},
  titleRightSide: null,
  subTasks: [],
  updateSubTask: () => {},
};

export default MarkDownParser;

/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
import {
  Prism as SyntaxHighlighter,
} from 'react-syntax-highlighter';
import {
  Box, Checkbox, Link, useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import BeforeAfterSlider from '../../BeforeAfterSlider';
import Heading from '../../Heading';
import OnlyFor from '../../OnlyFor';
import tomorrow from '../syntaxHighlighter/tomorrow';
import { slugify } from '../../../../utils';
import Text from '../../Text';

export const MDLink = ({ children, href }) => (
  <Link
    href={href}
    fontSize="15px"
    color="blue.400"
    fontWeight="700"
    overflowWrap="anywhere"
    target="_blank"
    rel="noopener noreferrer"
  >
    {children}
  </Link>
);

export const Code = ({
  inline, className, children, ...props
}) => {
  const match = /language-(\w+)/.exec(className || '');

  return !inline && match ? (
    <SyntaxHighlighter
      showLineNumbers
      style={tomorrow}
      language={match[1]}
      PreTag="div"
      {...props}
    >
      {String(children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  ) : (
    <code className={`${className} highlight`} {...props}>
      {children}
    </code>
  );
};

function doWithDelay(timeout, doCallback) {
  return new Promise((res) => {
    setTimeout(() => {
      doCallback();
      res();
    }, timeout);
  });
}

export const BeforeAfter = ({ before, after }) => {
  const [delimerPersentPosition, setDelimerPercentPosition] = useState(50);
  const animationDemo = () => {
    setTimeout(async () => {
      const PARTS = 50;
      const timeSeconds = 0.1;
      const borderMin = 35;
      const delta = (delimerPersentPosition - borderMin) / PARTS;
      const timeout = (timeSeconds / PARTS) * 1000;
      let currentPosition = delimerPersentPosition;

      for (let i = 1; i <= PARTS; i += 1) {
        await doWithDelay(timeout, () => {
          currentPosition -= delta;
          setDelimerPercentPosition(currentPosition);
        });
      }
      await doWithDelay(1000, () => {});
      for (let i = 1; i <= PARTS; i += 1) {
        await doWithDelay(timeout, () => {
          currentPosition += delta;
          setDelimerPercentPosition(currentPosition);
        });
      }
      for (let i = 1; i <= PARTS; i += 1) {
        await doWithDelay(timeout, () => {
          currentPosition += delta;
          setDelimerPercentPosition(currentPosition);
        });
      }
      await doWithDelay(1000, () => {});
      for (let i = 1; i <= PARTS; i += 1) {
        await doWithDelay(timeout, () => {
          currentPosition -= delta;
          setDelimerPercentPosition(currentPosition);
        });
      }
    }, 500);
  };

  return (
    <BeforeAfterSlider
      currentPercentPosition={delimerPersentPosition}
      firstImage={before}
      secondImage={after}
      onVisible={animationDemo}
      onChangePercentPosition={setDelimerPercentPosition}
    />
  );
};
export const MDHr = () => (<Box as="hr" backgroundColor={useColorModeValue('gray.400', 'gray.500')} mb="20px" />);

export const MDText = ({ children }) => (
  <Text size="l" letterSpacing="0.05em" marginBottom="16px" fontWeight="400" lineHeight="24px">
    {children}
  </Text>
);

export const MDTable = ({ children }) => (
  <Box
    as="div"
    minW={{ base: '84vw', md: 'auto' }}
    maxW={{ base: '84vw', md: 'auto' }}
    // minW="100vw"
    // maxW="100vw"
    width="100%"
    overflow="auto"
  >
    <Box
      as="table"
    >
      {children}
    </Box>

  </Box>
);

export const MDHeading = ({ children, tagType }) => {
  const variantsStyle = {
    h1: 'sm',
    h2: 'sm',
    h3: '18px',
  };
  const id = slugify(String(children));

  return (
    <Heading
      as={tagType} // h1, h2, h3, h4, h5, h6
      id={id}
      size={variantsStyle[tagType] || 'sm'}
      padding="20px 0 15px 0"
      marginBottom="16px"
    >
      {children}
    </Heading>
  );
};

export const MDCheckbox = ({
  index, children, subTasks, subTasksLoaded, subTasksProps, setSubTasksProps, updateSubTask,
}) => {
  const childrenData = children[1]?.props?.children || children;
  const text = children[1]?.props?.children[1] || children[1];
  const cleanedChildren = childrenData.length > 0 && childrenData.filter((l) => l.type !== 'input');
  // const checked = props?.checked || props?.children[1]?.props?.children[0]?.props?.checked;

  const slug = typeof text === 'string' && slugify(text);
  const currentSubTask = subTasks.length > 0 && subTasks.filter((task) => task.id === slug);
  const taskChecked = subTasks && subTasks.filter((task) => task.id === slug && task.status !== 'PENDING').length > 0;
  const [isChecked, setIsChecked] = useState(taskChecked || false);

  const taskStatus = {
    true: 'DONE',
    false: 'PENDING',
  };

  useEffect(() => {
    if (subTasksLoaded) {
      if (subTasksProps?.length > 0 && subTasksProps.find((l) => l.id === slug)) return () => {};

      if (currentSubTask) {
        setSubTasksProps((prev) => {
          if (prev.length > 0) {
            return [...prev, currentSubTask[0]];
          }
          return [currentSubTask[0]];
        });
      } else {
        setSubTasksProps((prev) => {
          if (prev?.length > 0) {
            return [
              ...prev,
              {
                id: slug,
                status: 'PENDING',
                label: text,
              },
            ];
          }
          return [
            {
              id: slug,
              status: 'PENDING',
              label: text,
            },
          ];
        });
      }
    }
    return () => {};
  }, [subTasksLoaded]);

  const handleChecked = async () => {
    setIsChecked(!isChecked);
    const taskProps = {
      id: slug,
      label: text,
      status: taskStatus[!isChecked],
    };
    if (subTasks?.length > 0) {
      await updateSubTask(taskProps);
    }
  };

  return (
    <Box as="li" id={slug} display="block" marginLeft="-1.5rem">
      <Checkbox id={`${index}`} alignItems="flex-start" isChecked={isChecked} onChange={() => handleChecked()}>
        {cleanedChildren}
      </Checkbox>
    </Box>
  );
};

export const OnlyForBanner = ({
  children, permission, cohortSession, profile,
}) => {
  const capabilities = (permission || '')?.split(',');
  console.log('md_permissions:', capabilities);

  return (
    <OnlyFor onlyMember withBanner profile={profile} cohortSession={cohortSession} capabilities={capabilities}>
      {children}
    </OnlyFor>
  );
};

Code.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  inline: PropTypes.bool,
};
Code.defaultProps = {
  className: '',
  inline: false,
};

MDLink.propTypes = {
  children: PropTypes.node.isRequired,
  href: PropTypes.string.isRequired,
};

BeforeAfter.propTypes = {
  before: PropTypes.string.isRequired,
  after: PropTypes.string.isRequired,
};

MDHeading.propTypes = {
  children: PropTypes.node.isRequired,
  tagType: PropTypes.string,
};

MDHeading.defaultProps = {
  tagType: 'h2',
};

MDCheckbox.propTypes = {
  children: PropTypes.node.isRequired,
  index: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  subTasks: PropTypes.arrayOf(PropTypes.object),
  subTasksLoaded: PropTypes.bool,
  subTasksProps: PropTypes.arrayOf(PropTypes.object),
  setSubTasksProps: PropTypes.func,
  updateSubTask: PropTypes.func,
};
MDCheckbox.defaultProps = {
  index: 0,
  subTasks: [],
  subTasksLoaded: false,
  subTasksProps: [],
  setSubTasksProps: () => {},
  updateSubTask: () => {},
};

// MDText.propTypes = {
//   children: PropTypes.node,
// };
// MDText.defaultProps = {
//   children: '',
// };

MDTable.propTypes = {
  children: PropTypes.node.isRequired,
};
MDText.propTypes = {
  children: PropTypes.node.isRequired,
};

OnlyForBanner.propTypes = {
  children: PropTypes.node.isRequired,
  permission: PropTypes.string,
  cohortSession: PropTypes.objectOf(PropTypes.any),
  profile: PropTypes.objectOf(PropTypes.any),
};
OnlyForBanner.defaultProps = {
  permission: '',
  cohortSession: {},
  profile: {},
};

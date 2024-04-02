/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { Box, Checkbox, Link, useColorModeValue, Flex } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import ReactDOMServer from 'react-dom/server';
import BeforeAfterSlider from '../../BeforeAfterSlider';
import Heading from '../../Heading';
import OnlyFor from '../../OnlyFor';
import tomorrow from '../syntaxHighlighter/tomorrow';
import { slugify } from '../../../../utils';
import Text from '../../Text';
import quoteImg from '../../../img/quote.png';
import whiteQuoteImg from '../../../img/white-quote.png';
import { log } from '../../../../utils/logging';

export function Wrapper({ children, ...rest }) {
  const style = rest.style || {};

  return (
    <Box as="div" style={style}>
      {children}
    </Box>
  );
}
export function MDLink({ children, href }) {
  const includesProtocol = href.startsWith('http');
  const protocol = includesProtocol ? '' : 'https://';
  return (
    <Link
      as="a"
      href={`${protocol}${href}`}
      fontSize="inherit"
      color="blue.400"
      fontWeight="700"
      overflowWrap="anywhere"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </Link>
  );
}

export function Code({ inline, showLineNumbers, showInlineLineNumbers, className, children }) {
  const match = /language-(\w+)/.exec(className || '');

  return !inline && match ? (
    <SyntaxHighlighter
      showLineNumbers={showLineNumbers}
      showInlineLineNumbers={showInlineLineNumbers}
      style={tomorrow}
      customStyle={{
        padding: showLineNumbers ? '1em 0px' : '16px',
      }}
      language={match[1]}
      PreTag="div"
    >
      {String(children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  ) : (
    <code className={`${className ?? ''} highlight`}>
      {children}
    </code>
  );
}

// quote style versions
function QuoteVersion1({ ...props }) {
  const { id, ...rest } = props;
  const quote = props.children[0].split('--');
  return (
    <Flex justifyContent="center" alignItems="center">
      <Box
        {...rest}
        className="quote-container"
        display="flex"
        alignContent="center"
        width="100%"
      >
        <Box
          className="quote-img"
          bg="#EEF9FE"
          mr="3"
          padding="9px"
        >
          <img src={quoteImg.src} alt="quoteImg" />
        </Box>
        <Box className="quote-content">
          <Box className="quote-paragraph">
            {quote[0].trim()}
            &quot;
          </Box>
          <Box
            className="quote-author"
            fontSize="xs"
            margin="1.5%"
            color="#0097CF"
          >
            --
            {quote[1]}
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}
function QuoteVersion2({ ...props }) {
  const quote = props.children[0].split('--');
  return (
    <Flex justifyContent="center" alignItems="center" flexDirection="column">
      <Box
        className="quote-container"
        display="flex"
        flexDirection="column"
        alignContent="center"
        width="100%"
      >
        <Box
          className="quote-divider-container"
          display="flex"
          alignItems="center"
        >
          <Box className="quote-img" width="3.5%" mr="5" mb="3">
            <img src={quoteImg.src} alt="quoteImg" />
          </Box>
          <hr
            style={{
              width: '100%',
              backgroundColor: '#cccccca6',
              height: '0.5px',
              marginBottom: '8px',
            }}
          />
        </Box>
        <Box className="quote-content">
          <Box className="quote-paragraph">
            {quote[0].trim()}
            &quot;
          </Box>
          <Box
            className="quote-author"
            fontSize="xs"
            margin="1.5%"
            color="#0097CF"
          >
            --
            {quote[1]}
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}
function QuoteVersion3({ ...props }) {
  const quote = props.children[0].split('--');
  const splitP = quote[0].split('.');

  return (
    <Flex justifyContent="center" alignItems="center" flexDirection="column">
      <Box
        className="quote-container"
        display="flex"
        flexDirection="column"
        alignContent="center"
        width="100%"
      >
        <Box className="quote-img" width="3.5%" mr="5" mb="3">
          <img src={quoteImg.src} alt="quoteImg" />
        </Box>
        <Box className="quote-content">
          <Box className="quote-paragraph-container">
            <Box className="quote-paragraph">
              {splitP[0].split(' ').map((item, index) => (
                <span
                  key={item}
                  style={{
                    backgroundColor: '#0097CF',
                    marginRight: '3px',
                    padding: '0px 1px 2px 3px',
                    color: 'white',
                  }}
                >
                  {index === splitP[0].split(' ').length - 1
                    ? `${item}. ` : `${item} `}
                </span>
              ))}
              {splitP[1].trim()}
              &quot;
            </Box>
          </Box>
          <Box
            className="quote-author"
            fontSize="xs"
            margin="1.5%"
            color="#0097CF"
          >
            --
            {quote[1]}
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}
function QuoteVersion4({ ...props }) {
  const quote = props.children[0].split('--');
  return (
    <Flex justifyContent="center" alignItems="center" flexDirection="column">
      <Box
        className="quote-container"
        display="flex"
        flexDirection="column"
        alignContent="center"
        width="100%"
      >
        <Box
          className="quote-img"
          width="5.5%"
          bg="#0097CF"
          p="5px"
          mr="5"
          mb="2"
        >
          <img src={whiteQuoteImg.src} alt="quoteImg" />
        </Box>
        <Box className="quote-content">
          <Box className="quote-paragraph">
            {quote[0].trim()}
            &quot;
          </Box>
          <Box
            className="quote-author"
            fontSize="xs"
            margin="1.5%"
            color="#0097CF"
          >
            --
            {quote[1]}
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}
export function Quote({ children }) {
  const [version, setVersion] = useState(2);

  useEffect(() => {
    setVersion(Math.floor(Math.random() * 4) + 1);
  }, []);
  if (version === 1 && children.length > 0) {
    return (
      <QuoteVersion1>
        {children}
      </QuoteVersion1>
    );
  } if (version === 2 && children.length > 0) {
    return (
      <QuoteVersion2>
        {children}
      </QuoteVersion2>
    );
  } if (version === 3 && children.length > 0) {
    return (
      <QuoteVersion3>
        {children}
      </QuoteVersion3>
    );
  } if (version === 4 && children.length > 0) {
    return (
      <QuoteVersion4>
        {children}
      </QuoteVersion4>
    );
  }
  return null;
}

function doWithDelay(timeout, doCallback) {
  return new Promise((res) => {
    setTimeout(() => {
      doCallback();
      res();
    }, timeout);
  });
}

export function BeforeAfter({ before, after }) {
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
}
export function MDHr() {
  return <Box as="hr" backgroundColor={useColorModeValue('gray.400', 'gray.500')} mb="20px" />;
}

export function MDText({ children, ...rest }) {
  return (
    <Text size="l" fontWeight="400" {...rest}>
      {children}
    </Text>
  );
}

export function MDTable({ children }) {
  return (
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
}

export function MDHeading({ children, tagType }) {
  const variantsStyle = {
    h1: 'sm',
    h2: 'sm',
    h3: '18px',
    h4: '16px',
  };
  const id = children?.[0]?.props
    ? slugify(String(children?.[0]?.props?.children))
    : slugify(String(children));

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
}

export function DOMComponent({ children }) {
  return <Box>{children}</Box>;
}

export function MDCheckbox({
  index, children, subTasks, subTasksLoaded, subTasksProps, setSubTasksProps, updateSubTask,
}) {
  const childrenData = children[1]?.props?.children || children;
  const [isChecked, setIsChecked] = useState(false);

  const cleanedChildren = childrenData.length > 0 && childrenData.filter((l) => l.type !== 'input');
  const domElement = <DOMComponent>{cleanedChildren}</DOMComponent>;

  const renderToStringClient = () => {
    if (typeof window !== 'undefined') {
      const html = ReactDOMServer.renderToString(domElement);
      const parser = new DOMParser();
      const doc = parser ? parser.parseFromString(html, 'text/html') : null;
      const textContent = doc?.body?.textContent || '';
      return textContent;
    }
    return '';
  };

  const text = renderToStringClient();

  const slug = typeof text === 'string' && slugify(text);
  const currentSubTask = subTasks.length > 0 && subTasks.filter((task) => task?.id === slug);
  const taskChecked = subTasks && subTasks.filter((task) => task?.id === slug && task?.status !== 'PENDING').length > 0;

  useEffect(() => {
    // load checked tasks
    if (taskChecked) {
      setIsChecked(true);
    }
  }, [taskChecked]);

  const taskStatus = {
    true: 'DONE',
    false: 'PENDING',
  };

  useEffect(() => {
    if (subTasksLoaded) {
      if (
        subTasksProps?.length > 0 && subTasksProps.find((l) => l?.id === slug)
      ) { return () => {}; }

      if (currentSubTask.length > 0) {
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
      <Checkbox
        id={`${index}`}
        alignItems="flex-start"
        isChecked={isChecked}
        onChange={() => handleChecked()}
      >
        {cleanedChildren}
      </Checkbox>
    </Box>
  );
}

export function OnlyForBanner({
  children, permission, include, exclude, cohortSession, profile,
}) {
  const allCapabilities = permission.split(',').concat(include.split(',').concat(exclude.split(',')));
  log('md_permissions:', allCapabilities);

  return (
    <OnlyFor
      onlyMember
      withBanner
      profile={profile}
      cohortSession={cohortSession}
      capabilities={allCapabilities}
    >
      {children}
    </OnlyFor>
  );
}

Wrapper.propTypes = {
  children: PropTypes.node.isRequired,
};
Code.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  inline: PropTypes.bool,
  showLineNumbers: PropTypes.bool,
  showInlineLineNumbers: PropTypes.bool,
};
Code.defaultProps = {
  className: '',
  inline: false,
  showLineNumbers: true,
  showInlineLineNumbers: true,
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
  subTasks: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  subTasksLoaded: PropTypes.bool,
  subTasksProps: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
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
  cohortSession: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  profile: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  include: PropTypes.string,
  exclude: PropTypes.string,
};
OnlyForBanner.defaultProps = {
  permission: '',
  cohortSession: {},
  profile: {},
  include: '',
  exclude: '',
};
DOMComponent.propTypes = {
  children: PropTypes.node.isRequired,
};

Quote.propTypes = {
  children: PropTypes.node,
  // id: PropTypes.string,
};
Quote.defaultProps = {
  children: '',
  // id: '',
};
QuoteVersion1.propTypes = {
  children: PropTypes.node,
  id: PropTypes.string,
};
QuoteVersion1.defaultProps = {
  children: '',
  id: '',
};
QuoteVersion2.propTypes = {
  children: PropTypes.node,
  id: PropTypes.string,
};
QuoteVersion2.defaultProps = {
  children: '',
  id: '',
};
QuoteVersion3.propTypes = {
  children: PropTypes.node,
  id: PropTypes.string,
};
QuoteVersion3.defaultProps = {
  children: '',
  id: '',
};
QuoteVersion4.propTypes = {
  children: PropTypes.node,
  id: PropTypes.string,
};
QuoteVersion4.defaultProps = {
  children: '',
  id: '',
};

/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { Box, Checkbox, Link, useColorModeValue, Flex } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import useTranslation from 'next-translate/useTranslation';
import ReactDOMServer from 'react-dom/server';
import BeforeAfterSlider from '../../BeforeAfterSlider';
import Heading from '../../Heading';
import OnlyFor from '../../OnlyFor';
import tomorrow from '../syntaxHighlighter/tomorrow';
import { slugify } from '../../../../utils';
import Text from '../../Text';
import quoteImg from '../../../img/quote.png';
import whiteQuoteImg from '../../../img/white-quote.png';

export function generateId(children) {
  const text = children ? children
    .map((child) => {
      if (typeof child === 'string') {
        return child;
      } if (child?.props && typeof child?.props?.children?.[0] === 'string') {
        return child.props.children[0];
      }
      if (child?.props && typeof child.props.alt === 'string') {
        return child.props.alt;
      }
      return child;
    })
    .join('') : '';

  return slugify(text, { lower: true });
}
export function Wrapper({ children, ...rest }) {
  const style = rest.style || {};

  return (
    <Box as="div" style={style}>
      {children}
    </Box>
  );
}
export function MDLink({ children, href }) {
  function isExternalUrl(url) {
    try {
      const baseUrl = process.env.DOMAIN_NAME || '';
      const base = new URL(baseUrl);

      // Handle relative URLs by using the base URL as a reference
      const fullUrl = url.startsWith('http') ? url : new URL(url, baseUrl).href;

      // Create a URL object based on the full URL
      const linkUrl = new URL(fullUrl, baseUrl);

      // Normalize the base hostname by potentially removing 'www.'
      const baseDomain = base.hostname.replace(/^(www\.)?/, '');

      // Check if the link's hostname ends with the base domain
      const isInternalDomain = linkUrl.hostname.endsWith(baseDomain);

      // Check port and scheme as well
      const isSamePort = linkUrl.port === base.port || (linkUrl.port === '' && base.port === '') || (linkUrl.protocol === 'http:' && linkUrl.port === '80' && base.port === '') || (linkUrl.protocol === 'https:' && linkUrl.port === '443' && base.port === '');

      return !(isInternalDomain && isSamePort);
    } catch (e) {
      console.error('Invalid URL:', e.message);
      return false; // If URL is invalid, handle as needed
    }
  }
  const external = isExternalUrl(href);
  return (
    <Link
      as="a"
      href={href}
      fontSize="inherit"
      color="blue.400"
      fontWeight="700"
      overflowWrap="anywhere"
      target={external ? '_blank' : '_self'}
      rel={external ? 'noopener noreferrer' : ''}
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
  const version = 1;
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
      await doWithDelay(1000, () => { });
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
      await doWithDelay(1000, () => { });
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
  const id = generateId(children);
  const idLimited = id.length > 50 ? id.slice(0, 50) : id;
  return (
    <Text id={idLimited} size="l" fontWeight="400" {...rest}>
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
  const id = generateId(children);

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
  index, children, subTasks, newSubTasks, setNewSubTasks, updateSubTask, subtaskFirstLoad, currentTask,
}) {
  const [isChecked, setIsChecked] = useState(false);
  const { lang } = useTranslation();
  const taskStatus = { true: 'DONE', false: 'PENDING' };
  const childrenData = children[1]?.props?.children || children;

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
  const currentSubTask = subTasks.find((task) => slugify(task?.label) === slug);

  useEffect(() => {
    const subtaskCheked = subTasks.some((subtask) => subtask?.id === currentSubTask?.id && subtask?.status !== 'PENDING');
    if (subtaskCheked) setIsChecked(true);
  }, [subTasks]);

  useEffect(() => {
    if (newSubTasks?.length > 0 && newSubTasks.find((l) => l?.id === slug)) return;
    const prevSubtasks = localStorage.getItem(`prevSubtasks_${currentTask?.associated_slug}`);

    if (prevSubtasks) {
      try {
        const prevParsedSubtasks = JSON.parse(prevSubtasks);
        if (Array.isArray(prevParsedSubtasks)) {
          setNewSubTasks((prev) => {
            const content = [...prev];
            const prevSubtask = prevParsedSubtasks.find((subtask) => subtask.position === content.length);
            const task = {
              id: slug,
              position: content.length,
              lang,
              status: prevSubtask?.status || 'PENDING',
              label: text,
            };
            if (!content.some((subTask) => subTask.id === task.id)) content.push(task);
            return content;
          });
        }
      } catch (error) {
        console.error('Error al parsear prevSubtasks:', error);
      }
    }

    setNewSubTasks((prev) => {
      const content = [...prev];
      const task = {
        id: slug,
        position: content.length,
        lang,
        status: 'PENDING',
        label: text,
      };
      if (!content.some((subTask) => subTask.id === task.id)) content.push(task);
      return content;
    });
  }, [subtaskFirstLoad]);

  const handleChecked = async () => {
    setIsChecked(!isChecked);
    const taskProps = {
      id: currentSubTask.id,
      label: text,
      lang: currentSubTask.lang,
      position: currentSubTask.position,
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
  children, permission, include, exclude, saas, withbanner,
}) {
  const allCapabilities = permission.split(',').concat(include.split(',').concat(exclude.split(',')));

  const parsedWithBanner = ['true', 'True', '1'].includes(String(withbanner));

  return (
    <OnlyFor
      onlyMember
      withBanner={parsedWithBanner}
      capabilities={allCapabilities}
      saas={saas}
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
  currentTask: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  subtaskFirstLoad: PropTypes.bool.isRequired,
  newSubTasks: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  setNewSubTasks: PropTypes.func,
  updateSubTask: PropTypes.func,
};
MDCheckbox.defaultProps = {
  index: 0,
  subTasks: [],
  newSubTasks: [],
  currentTask: {},
  setNewSubTasks: () => { },
  updateSubTask: () => { },
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
  include: PropTypes.string,
  exclude: PropTypes.string,
  saas: PropTypes.string,
  withbanner: PropTypes.string,
};
OnlyForBanner.defaultProps = {
  permission: '',
  include: '',
  exclude: '',
  saas: '',
  withbanner: true,
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

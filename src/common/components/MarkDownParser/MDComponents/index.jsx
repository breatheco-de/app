/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
import {
  Prism as SyntaxHighlighter,
} from 'react-syntax-highlighter';
import {
  Box, Checkbox, Link, useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useState } from 'react';
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

export const MDCheckbox = (props) => {
  const text = props?.children[1] || props?.children[1]?.props?.children[1];
  const child = props?.children[2] || props?.children[2]?.props?.children[2];
  const checked = props?.checked || props?.children[1]?.props?.children[0]?.props?.checked;
  const [isChecked, setIsChecked] = useState(checked);

  return (
    <Box as="li" display="block">
      <Checkbox isChecked={isChecked} onChange={() => setIsChecked(!isChecked)}>
        {text}
      </Checkbox>
      {child && child}
    </Box>
  );
};

export const OnlyForBanner = ({ children, permission, cohortSession }) => {
  const capabilities = (permission || '')?.split(',');
  console.log('md_permissions:', capabilities);

  if (cohortSession.bc_id && !cohortSession?.user_capabilities) {
    // eslint-disable-next-line no-param-reassign
    cohortSession.user_capabilities = [''];
    //   cohortSession.user_capabilities = ['read_private_lesson', 'read_lesson', 'student'];
  }

  return (
    <OnlyFor onlyMember withBanner cohortSession={cohortSession} capabilities={capabilities}>
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
};
OnlyForBanner.defaultProps = {
  permission: '',
  cohortSession: {},
};

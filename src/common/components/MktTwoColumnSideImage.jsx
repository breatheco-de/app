/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import {
  Box, Img,
} from '@chakra-ui/react';
import { PrismicRichText } from '@prismicio/react';
import Heading from './Heading';
import Text from './Text';
import Link from './NextChakraLink';
import useStyle from '../hooks/useStyle';

const MktTwoColumnSideImage = ({
  title,
  subTitle,
  description,
  imageUrl,
  linkButton,
  buttonUrl,
  buttonLabel,
  background,
  border,
  imagePosition,
  slice,
  imageAlt,
}) => {
  const { fontColor2, hexColor, backgroundColor } = useStyle();
  const flexDirection = {
    right: 'row-reverse',
    left: 'row',
  };

  return (
    <Box
      padding="20px"
      display="flex"
      flexWrap={{ base: 'wrap', md: 'nowrap' }}
      gridGap="20px"
      background={background || backgroundColor}
      border={border}
      flexDirection={flexDirection[imagePosition]}
    >
      <Box width={{ base: '100% 0', md: '50%' }}>
        <Img
          boxSize="100%"
          objectFit="cover"
          src={imageUrl}
          alt={imageAlt}
          borderRadius="3px"
        />
      </Box>
      <Box width={{ base: '100% 0', md: '50%' }}>
        <Heading marginBottom="15px" as="h4" fontSize="14px" color={hexColor.blueDefault}>
          {subTitle}
        </Heading>
        <Heading as="h2" size="sm">
          {title}
        </Heading>
        {slice.primary.description ? (
          <PrismicRichText
            field={slice?.primary?.description}
            components={{
              paragraph: ({ children }) => (
                <Text
                  fontSize="sm"
                  lineHeight="14px"
                  margin="15px 0"
                  color={fontColor2}
                >
                  {children}
                </Text>
              ),
            }}
          />
        ) : (
          <Text
            fontSize="sm"
            lineHeight="14px"
            margin="15px 0"
            color={fontColor2}
          >
            {description}
          </Text>
        )}
        {buttonUrl && (
          <Link
            variant={!linkButton && 'buttonDefault'}
            color={linkButton ? hexColor.blueDefault : '#FFF'}
            href={buttonUrl}
            textAlign="center"
            display="inline-block"
          >
            {buttonLabel}
          </Link>
        )}
      </Box>
    </Box>
  );
};

MktTwoColumnSideImage.propTypes = {
  title: PropTypes.string,
  subTitle: PropTypes.string,
  description: PropTypes.string,
  imagePosition: PropTypes.string,
  imageUrl: PropTypes.string,
  linkButton: PropTypes.bool,
  buttonUrl: PropTypes.string,
  buttonLabel: PropTypes.string,
  background: PropTypes.string,
  border: PropTypes.string,
  slice: PropTypes.oneOfType([PropTypes.object, PropTypes.any]),
  imageAlt: PropTypes.string,
};

MktTwoColumnSideImage.defaultProps = {
  title: null,
  subTitle: null,
  description: null,
  imagePosition: 'left',
  imageUrl: null,
  linkButton: false,
  buttonUrl: null,
  buttonLabel: null,
  background: null,
  border: null,
  slice: null,
  imageAlt: '',
};

export default MktTwoColumnSideImage;

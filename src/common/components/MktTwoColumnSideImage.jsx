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

  const imageProps = slice && slice?.primary?.image?.dimensions;

  return (
    <Box
      padding="20px 0"
      display="flex"
      flexWrap={{ base: 'wrap', md: 'nowrap' }}
      gridGap="20px"
      background={background || backgroundColor}
      border={border}
      alignItems="center"
      borderRadius="12px"
      flexDirection={flexDirection[imagePosition]}
    >
      <Box width={{ base: '100% 0', md: '50%' }}>
        <Img
          boxSize="100%"
          margin="0 auto"
          objectFit="contain"
          src={imageUrl}
          alt={imageAlt}
          title={imageAlt}
          borderRadius="3px"
          height={imageProps?.height}
          width={imageProps?.width}
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
            variant="buttonDefault"
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
  buttonUrl: null,
  buttonLabel: null,
  background: null,
  border: null,
  slice: null,
  imageAlt: '',
};

export default MktTwoColumnSideImage;

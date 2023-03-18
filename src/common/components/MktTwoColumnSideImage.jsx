import PropTypes from 'prop-types';
import {
  Box, Img,
} from '@chakra-ui/react';
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
}) => {
  const { fontColor2, hexColor, backgroundColor } = useStyle();
  const flexDirection = {
    right: 'row',
    left: 'row-reverse',
  };

  return (
    <Box
      padding="20px"
      display="flex"
      gridGap="20px"
      background={background || backgroundColor}
      border={border}
      borderRadius="12px"
      flexDirection={flexDirection[imagePosition]}
    >
      <Box width="50%">
        <Img
          boxSize="100%"
          objectFit="cover"
          src={imageUrl}
        />
      </Box>
      <Box width="50%">
        <Heading marginBottom="15px" as="h4" fontSize="14px" color={hexColor.blueDefault}>
          {subTitle}
        </Heading>
        <Heading as="h2" size="sm">
          {title}
        </Heading>
        <Text
          fontSize="sm"
          lineHeight="14px"
          margin="15px 0"
          color={fontColor2}
        >
          {description}
        </Text>
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
};

MktTwoColumnSideImage.defaultProps = {
  title: null,
  subTitle: null,
  description: null,
  imagePosition: 'right',
  imageUrl: null,
  buttonUrl: null,
  buttonLabel: null,
  background: null,
  border: null,
};

export default MktTwoColumnSideImage;

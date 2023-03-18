import PropTypes from 'prop-types';
import {
  Box,
} from '@chakra-ui/react';
import Heading from './Heading';
import Text from './Text';
import Link from './NextChakraLink';
import useStyle from '../hooks/useStyle';

const MktOneColumn = ({
  title,
  subTitle,
  description,
  buttonUrl,
  buttonLabel,
}) => {
  const { fontColor2, hexColor } = useStyle();

  return (
    <Box padding="20px" textAlign="center">
      <Box>
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

MktOneColumn.propTypes = {
  title: PropTypes.string,
  subTitle: PropTypes.string,
  description: PropTypes.string,
  buttonUrl: PropTypes.string,
  buttonLabel: PropTypes.string,
};

MktOneColumn.defaultProps = {
  title: null,
  subTitle: null,
  description: null,
  buttonUrl: null,
  buttonLabel: null,
};

export default MktOneColumn;

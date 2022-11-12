/* eslint-disable no-unused-vars */
import PropTypes from 'prop-types';
import {
  Box,
  useColorModeValue,
  Button,
} from '@chakra-ui/react';
import Text from './Text';
import Heading from './Heading';

const ProgramCard = ({
  programName,
  programDescription,
  isBought,
  haveFreeTrial,
  stTranslation,
}) => {
  const textColor = useColorModeValue('black', 'white');
  return (
    <Box
      border="1px solid"
      borderColor="#DADADA"
      borderRadius="9px"
      width="292px"
      padding="15px"
    >
      {/* <Heading as="label">{programName}</Heading> */}
      <Text
        fontSize="md"
        lineHeight="19px"
        fontWeight="700"
        color={textColor}
        marginBottom="10px"
      >
        {programName}
        {' '}
      </Text>

      {!isBought && (
        <>
          <Text
            fontSize="xs"
            lineHeight="14px"
            fontWeight="500"
            color={textColor}
          >
            {programDescription}
            {' '}
          </Text>
          <Button
            marginTop="30px"
            borderRadius="3px"
            width="100%"
            padding="0"
            whiteSpace="normal"
            variant="default"
          >
            Start Course
          </Button>
          {haveFreeTrial && (
            <Button
              marginTop="15px"
              borderRadius="3px"
              width="100%"
              padding="0"
              whiteSpace="normal"
              variant="outline"
              borderColor="blue.default"
              color="blue.default"
            >
              Free Trial
            </Button>
          )}
        </>
      )}
    </Box>
  );
};

ProgramCard.propTypes = {
  programName: PropTypes.string.isRequired,
  programDescription: PropTypes.string,
  isBought: PropTypes.bool,
  haveFreeTrial: PropTypes.bool,
  stTranslation: PropTypes.objectOf(PropTypes.any),
};

ProgramCard.defaultProps = {
  stTranslation: null,
  programDescription: null,
  haveFreeTrial: false,
  isBought: false,
};

export default ProgramCard;

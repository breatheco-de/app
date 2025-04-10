import { Flex, Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Heading from '../Heading';
import Icon from '../Icon';

function TitleContent({
  title, icon, color, ...rest
}) {
  return (
    <Flex
      alignItems="center"
      gridGap="20px"
      display="flex"
      {...rest}
    >
      <Box
        display="flex"
        justifyContent="center"
        width="35px"
        height="35px"
        borderRadius="3rem"
        backgroundColor="yellow.default"
        alignItems="center"
      >
        <Icon icon={icon} color={color} width="24px" height="24px" />
      </Box>

      <Heading as="h1" size="30px">
        {title}
      </Heading>
    </Flex>
  );
}

TitleContent.propTypes = {
  title: PropTypes.string,
  icon: PropTypes.string,
  color: PropTypes.string,
};
TitleContent.defaultProps = {
  title: 'Title',
  icon: 'strength',
  color: '#FFFFFF',
};

export default TitleContent;

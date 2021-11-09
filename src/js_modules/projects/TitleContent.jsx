import { Flex, Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Heading from '../../common/components/Heading';
import Icon from '../../common/components/Icon';

const TitleContent = ({ title, mobile }) => (
  <Flex
    alignItems="center"
    gridGap="20px"
    padding={mobile === true ? '4% 4% 0 4%' : ''}
    display={mobile === true ? { base: 'flex', md: 'none' } : { base: 'none', md: 'flex' }}
  >
    <Box
      display="flex"
      justifyContent="center"
      width="35px"
      height="35px"
      borderRadius="3rem"
      backgroundColor="yellow.default"
    >
      <Icon icon="strength" color="white" width="22px" />
    </Box>

    <Heading as="h1" size="30px">
      {title}
    </Heading>
  </Flex>
);

TitleContent.propTypes = {
  title: PropTypes.string,
  mobile: PropTypes.bool,
};
TitleContent.defaultProps = {
  title: 'Title',
  mobile: true,
};

export default TitleContent;

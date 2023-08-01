import { Flex, Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Heading from '../../common/components/Heading';
import Icon from '../../common/components/Icon';

function TitleContent({
  title, icon, color, mobile,
}) {
  return (
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
  mobile: PropTypes.bool,
  icon: PropTypes.string,
  color: PropTypes.string,
};
TitleContent.defaultProps = {
  title: 'Title',
  mobile: true,
  icon: 'strength',
  color: '#FFFFFF',
};

export default TitleContent;

import { Box, Flex, Img, Link } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Icon from './Icon';
import Heading from './Heading';
import TagCapsule from './TagCapsule';
import Text from './Text';

const EventCard = ({ data, title, ...rest }) => {
  console.log('data:', data);

  return (
    <Flex flexDirection="column" gridGap="16px" maxWidth="320px" borderRadius="12px" padding="16px" border="2px solid" borderColor="blue.default" {...rest}>
      {/* head event info */}
      <Flex justifyContent="space-between" alignItems="center">
        <Box color="blue.default" display="flex" alignItems="center" gridGap="8px">
          <Icon icon="chronometer" color="currentColor" width="20px" height="20px" />
          <Text size="12px" fontWeight={700}>
            2 hr duration
          </Text>
        </Box>
        <Box display="flex" alignItems="center" gridGap="8px" padding="4px 10px" color="danger" background="red.light" borderRadius="18px">
          <Icon icon="dot" color="currentColor" width="9px" height="9px" />
          <Text size="12px" fontWeight={700}>
            Live now!
          </Text>
        </Box>
      </Flex>

      <Heading size="sm" fontWeight={700}>
        {title}
      </Heading>

      <TagCapsule tags={['Machine learning']} fontSize="13px" borderRadius="20px" fontWeight={700} padding="8px 16px" margin="-5px 0 0 0" />

      <Text size="14px">
        Yorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsa.
      </Text>

      {/* Teacher info */}
      <Flex gridGap="8px">
        <Box width="35px" height="35px">
          <Img src="https://via.placeholder.com/150" alt="teacher" width="100%" height="100%" borderRadius="50px" />
        </Box>
        <Box>
          <Heading size="14px" fontWeight={700}>
            Teacher name
          </Heading>
          <Text size="12px" fontWeight={700}>Teacher title</Text>
          <Text size="12px" fontWeight={400}>
            Teacher work
          </Text>
        </Box>
      </Flex>

      <Link href="#top" color="blue.default" display="flex" alignItems="center" justifyContent="center" gridGap="10px">
        Join workshop
        <Icon icon="longArrowRight" width="24px" height="10px" color="currentColor" />
      </Link>
    </Flex>
  );
};

EventCard.propTypes = {
  data: PropTypes.objectOf(PropTypes.any),
  title: PropTypes.string.isRequired,
};

EventCard.defaultProps = {
  data: {},
};

export default EventCard;

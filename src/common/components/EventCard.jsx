import { Box, Flex, Img, Link } from '@chakra-ui/react';
import Icon from './Icon';
import Heading from './Heading';
import TagCapsule from './TagCapsule';
import Text from './Text';

const EventCard = ({ ...rest }) => {
  console.log('');

  return (
    <Box maxWidth="320px" borderRadius="12px" padding="16px" border="2px solid" borderColor="blue.default" {...rest}>
      {/* head event info */}
      <Flex justifyContent="space-between" alignItems="center">
        <Box color="blue.default">
          <Icon icon="chronometer" color="currentColor" width="20px" height="20px" />
          2 hr duration
        </Box>
        <Box padding="4px 10px" color="danger" background="red.light" borderRadius="18px">
          <Icon icon="chronometer" color="currentColor" width="20px" height="20px" />
          Live now!
        </Box>
      </Flex>

      <Heading size="sm" fontWeight={700}>
        How to use React icons in Next.js
      </Heading>

      <TagCapsule tags={['Machine learning']} />

      <Text size="14px">
        Yorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsa.
      </Text>

      {/* Teacher info */}
      <Flex gridGap="8px">
        <Box width="35px" height="35px" borderRadius="50px">
          <Img src="https://via.placeholder.com/150" alt="teacher" width="100%" height="100%" />
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

      <Link href="#top" color="blue.default">
        Join workshop
        <Icon icon="longArrowRight" width="24px" height="10px" color="currentColor" />
      </Link>
    </Box>
  );
};

EventCard.propTypes = {};

EventCard.defaultProps = {};

export default EventCard;

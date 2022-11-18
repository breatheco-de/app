import PropTypes from 'prop-types';
import {
  Box, useColorModeValue, Text, Button,
} from '@chakra-ui/react';
import { MotionBox } from '../../common/components/Animated';
import Heading from '../../common/components/Heading';
import Icon from '../../common/components/Icon';

const IntroductionSection = ({
  data,
}) => {
  const colors = useColorModeValue('#000', '#fff');
  return (
    <Box display="flex">
      <Box flex={1}>
        <Heading as="h1" size="xl" fontWeight="700">
          {data?.title}
          {data?.highlight && (
            <MotionBox
              as="strong"
              className="highlighted box"
              transition={{ duration: 3 }}
              animate={{
                color: [colors, '#0097CD', colors, '#0097CD', colors, colors],
              }}
              margin="0 0 0 10px"
              display={{ base: 'none', sm: 'initial' }}
            >
              {data.highlight}
            </MotionBox>
          )}
        </Heading>
        <Box as="strong" className="highlighted" fontSize="35px" display={{ base: 'initial', sm: 'none' }}>
          {data.highlight}
        </Box>
        <Text fontSize="18px" fontWeight={700} pt="16px">
          {data.description}
        </Text>
        {data?.callToAction?.title && (
          <Button variant="default" fontSize="13px" m="25px 0" letterSpacing="0.05em" textTransform="uppercase">
            {data.callToAction.title}
          </Button>
        )}
        {data?.bullets && (
          <Box as="ul" display="flex" flexDirection="column" gridGap="4px" width="fit-content">
            {data.bullets.map((l) => (
              <MotionBox whileHover={{ scale: 1.05 }} as="li" key={l.text} display="flex" fontSize="14px" gridGap="10px" alignItems="center">
                <Icon icon={l.icon} width="14px" height="14px" />
                {l.text}
              </MotionBox>
            ))}
          </Box>
        )}
      </Box>
      {/* autoplay and loop static/videos/landing-avatars.mp4 video inside a canva and lazy loading */}
      <Box flex={0.5} display={{ base: 'none', lg: 'initial' }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: '400px',
            height: '100%',
            objectFit: 'cover',
          }}
        >
          <source src="static/videos/landing-avatars.mp4" type="video/mp4" />
        </video>
      </Box>

      {/* <Box
        position="relative"
        display={{ base: 'none', md: 'initial' }}
        flex={0.5}
      >
        <Icon icon="landing-avatars" width="354px" height="369px" />
      </Box> */}
    </Box>
  );
};

IntroductionSection.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default IntroductionSection;

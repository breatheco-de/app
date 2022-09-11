import PropTypes from 'prop-types';
import {
  Avatar, Box, Text, useColorModeValue, useMediaQuery,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Plx from 'react-plx';
import { AnimatedButton, MotionBox } from '../../common/components/Animated';
import Heading from '../../common/components/Heading';
import {
  avatars, parallaxAvatars,
} from '../../lib/landing-props';

const Students = ({ data }) => {
  const [isBelowTablet] = useMediaQuery('(max-width: 768px)');
  const color = useColorModeValue('gray.700', 'gray.300');
  const router = useRouter();

  return (
    <Box display="flex" py="20px" alignItems="center" justifyContent={{ base: 'center', md: 'start' }}>
      <Box display="flex" flexDirection="column" alignItems={{ base: 'center', md: 'start' }} flex={{ base: 1, md: 0.52 }} textAlign={{ base: 'center', md: 'left' }}>
        <Heading as="h2" size="14px" letterSpacing="0.05em" mb="10px" color="blue.default">
          {data.students.title}
        </Heading>
        <Text fontSize="26px" fontWeight="700" mb="10px" lineHeight="30px">
          {data.students.subTitle}
        </Text>
        <Text dangerouslySetInnerHTML={{ __html: data.students.description }} fontSize="14px" fontWeight="400" lineHeight="24px" letterSpacing="0.05em" color={color} />
        <AnimatedButton onClick={() => router.push(data.students.button.link)} mt="9px" alignSelf={{ base: 'center', md: 'start' }}>
          {data.students.button.title}
        </AnimatedButton>
      </Box>
      {/* List of images */}
      {!isBelowTablet && (
        // height="442px"
        <Box position="relative" flex={1} height="442px">
          <Plx style={{ position: 'absolute', left: 0, bottom: 0 }} parallaxData={parallaxAvatars}>
            <Box position="absolute" width="92px" height="92px" left="95px" bottom="107px" background="blue.light" borderRadius={50} filter="blur(10px)" />
            <Box position="absolute" width="78px" height="78px" left="195px" bottom="246px" background="blue.default" borderRadius={50} filter="blur(45px)" />
          </Plx>
          <MotionBox
            position="absolute"
            width="98px"
            height="98px"
            left="235px"
            bottom="266px"
            background="rgba(255, 183, 24, 0.36)"
            transition={{ duration: 3, repeat: Infinity }}
            animate={{
              left: ['205px', '225px', '235px', '205px'],
              bottom: ['236px', '266px', '260px', '236px'],
              scale: [1, 1.2, 1.2, 1],
              filter: ['blur(14px)', 'blur(34px)', 'blur(34px)', 'blur(14px)'],
            }}
            borderRadius={50}
            filter="blur(30px)"
          />
          <Plx style={{ position: 'absolute', left: 0, bottom: 0 }} parallaxData={parallaxAvatars}>
            <Box position="absolute" width="58px" height="58px" left="296px" bottom="138px" background="yellow.light" borderRadius={50} />
          </Plx>
          <Box position="absolute" width="24px" height="24px" left="382px" top="200px" background="blue.light" borderRadius={50} />
          <Plx style={{ position: 'absolute', right: 0, bottom: 0 }} parallaxData={parallaxAvatars}>
            <MotionBox
              position="absolute"
              width="80px"
              height="80px"
              right="180px"
              bottom="74px"
              background="blue.default"
              borderRadius={50}
              filter="blur(34px)"
              transition={{ duration: 3, repeat: Infinity }}
              animate={{
                right: ['172px', '180px', '188px', '172px'],
                bottom: ['64px', '74px', '78px', '64px'],
                scale: [1, 1.2, 1.2, 1],
                filter: ['blur(30px)', 'blur(34px)', 'blur(34px)', 'blur(30px)'],
              }}
            />
          </Plx>

          <Avatar src={avatars[0].picture} width="53px" height="53px" position="absolute" left="85px" bottom="226px" style={{ userSelect: 'none' }} alt={`${avatars[0].firstName}-${avatars[0].lastName}`} bg="transparent" />
          <Plx style={{ position: 'absolute', left: 0, top: 0 }} parallaxData={parallaxAvatars}>
            <Avatar src={avatars[1].picture} width="75px" height="75px" position="absolute" left="125px" top="0" style={{ userSelect: 'none' }} alt={`${avatars[1].firstName}-${avatars[1].lastName}`} bg="transparent" />
          </Plx>
          <Avatar src={avatars[2].picture} width="104px" height="104px" position="absolute" left="195px" bottom="240px" style={{ userSelect: 'none' }} alt={`${avatars[2].firstName}-${avatars[2].lastName}`} zIndex={2} bg="transparent" />
          <Avatar src={avatars[3].picture} width="65px" height="65px" position="absolute" left="185px" bottom="139px" style={{ userSelect: 'none' }} alt={`${avatars[3].firstName}-${avatars[3].lastName}`} zIndex={2} bg="transparent" />
          <Plx style={{ position: 'absolute', left: 0, bottom: 0 }} parallaxData={parallaxAvatars}>
            <Avatar src={avatars[4].picture} width="107px" height="107px" position="absolute" left="225px" bottom="0" style={{ userSelect: 'none' }} alt={`${avatars[4].firstName}-${avatars[4].lastName}`} zIndex={2} bg="transparent" />
          </Plx>
          <Avatar src={avatars[5].picture} width="81px" height="81px" position="absolute" left="336px" bottom="89px" style={{ userSelect: 'none' }} alt={`${avatars[5].firstName}-${avatars[5].lastName}`} zIndex={2} bg="transparent" />
          <Plx style={{ position: 'absolute', left: 0, top: 0 }} parallaxData={parallaxAvatars}>
            <Avatar src={avatars[6].picture} width="40px" height="40px" position="absolute" left="400px" top="210px" style={{ userSelect: 'none' }} alt={`${avatars[6].firstName}-${avatars[6].lastName}`} zIndex={2} bg="transparent" />
            <Avatar src={avatars[7].picture} width="44px" height="44px" position="absolute" left="410px" top="78px" style={{ userSelect: 'none' }} alt={`${avatars[7].firstName}-${avatars[7].lastName}`} zIndex={1} bg="transparent" />
          </Plx>
          <Avatar src={avatars[8].picture} width="80px" height="80px" position="absolute" right={{ md: '135px', lg: '235px' }} top="170px" style={{ userSelect: 'none' }} alt={`${avatars[8].firstName}-${avatars[8].lastName}`} zIndex={2} bg="transparent" />
          <Avatar src={avatars[9].picture} width="104px" height="104px" position="absolute" right={{ md: '110px', lg: '210px' }} bottom="40px" style={{ userSelect: 'none' }} alt={`${avatars[9].firstName}-${avatars[9].lastName}`} zIndex={2} bg="transparent" />
          <Plx style={{ position: 'absolute', right: 0, bottom: 0 }} parallaxData={parallaxAvatars}>
            <Avatar src={avatars[10].picture} width="45px" height="45px" position="absolute" right={{ md: '18px', lg: '118px' }} bottom="185px" style={{ userSelect: 'none' }} alt={`${avatars[10].firstName}-${avatars[10].lastName}`} zIndex={2} bg="transparent" />
          </Plx>
          <Plx style={{ position: 'absolute', right: 0, top: 0 }} parallaxData={parallaxAvatars}>
            <Avatar src={avatars[11].picture} width="53px" height="53px" position="absolute" right={{ md: '38px', lg: '138px' }} top="84px" style={{ userSelect: 'none' }} alt={`${avatars[11].firstName}-${avatars[11].lastName}`} zIndex={2} bg="transparent" />
          </Plx>
        </Box>
      )}
    </Box>
  );
};

Students.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default Students;

import {
  Avatar, Box, Button, Container, Text, useColorModeValue, useMediaQuery,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import PropTypes from 'prop-types';
import Plx from 'react-plx';
import Heading from '../../../common/components/Heading';
import Icon from '../../../common/components/Icon';
import { getDataContentSlugs, getDataContentProps } from '../../../utils/file';

export const getStaticPaths = async ({ locales }) => {
  const paths = getDataContentSlugs('public/locales/en/coding-introduction', locales);

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = async ({ params, locale }) => {
  const { slug } = params;
  console.log('locale');

  const data = getDataContentProps(
    `public/locales/${locale}/coding-introduction`,
    slug,
  );

  // console.log('data:::', data);
  return {
    props: {
      data,
    },
  };
};

const avatars = [
  {
    firstName: 'Jhon',
    lastName: 'Johnson',
    picture: '/static/images/p1.png',
  },
  {
    firstName: 'Jhon',
    lastName: 'Module',
    picture: '/static/images/p2.png',
  },
  {
    firstName: 'Harry',
    lastName: 'Jackson',
    picture: '/static/images/p5.png',
  },
  {
    firstName: 'Jimmy',
    lastName: 'Tomato',
    picture: '/static/images/p4.png',
  },
  {
    firstName: 'Jhonny',
    lastName: 'Johnson',
    picture: '/static/images/p3.png',
  },
  {
    firstName: 'Doe',
    lastName: 'Doe',
    picture: '/static/images/p6.png',
  },
  {
    firstName: 'Brian',
    lastName: 'Castro',
    picture: '/static/images/image1.png',
  },
  {
    firstName: 'George',
    lastName: 'Vegas',
    picture: '/static/images/code1.png',
  },
  {
    firstName: 'Jessie',
    lastName: 'Kamp',
    picture: '/static/images/person-smile1.png',
  },
  {
    firstName: 'Claudia',
    lastName: 'Casas',
    picture: '/static/images/person-smile2.png',
  },
  {
    firstName: 'Kevin',
    lastName: 'Read',
    picture: '/static/images/person-smile3.png',
  },
  {
    firstName: 'Mike',
    lastName: 'Torres',
    picture: '/static/images/person-smile4.png',
  },
];

const parallaxData = [
  {
    start: 0,
    end: 300,
    properties: [
      {
        startValue: 0.8,
        endValue: 1,
        property: 'scale',
      },
      {
        startValue: 0,
        endValue: 1,
        property: 'opacity',
      },
    ],
  },
];

const parallaxAvatars = [
  {
    start: 0,
    end: 400,
    properties: [
      {
        startValue: 0.3,
        endValue: 1,
        property: 'scale',
      },
      {
        startValue: 0,
        endValue: 1,
        property: 'opacity',
      },
    ],
  },

];

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const AnimatedButton = ({
  children, toUppercase, rest,
}) => (
  <MotionButton whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} variant="default" {...rest} fontSize="13px" m="25px 0" width="fit-content" letterSpacing="0.05em" textTransform={toUppercase ? 'uppercase' : ''}>
    {children}
  </MotionButton>
);

const CodingIntroduction = ({ data }) => {
  console.log('codingIntroduction props', data);
  const [isBelowTablet] = useMediaQuery('(max-width: 768px)');

  return (
    <Box pt="3rem">
      {/* maxW="container.xl" */}
      <Container maxW="container.xl">
        <Box display="flex">
          <Box flex={1}>
            <Heading as="h1" size="xl" fontWeight="700" shine>
              Coding Introduction
              <MotionBox
                as="strong"
                className="highlighted box"
                transition={{ duration: 3 }}
                animate={{
                  color: ['#000,', '#0097CD', '#000', '#0097CD', '#000', '#000'],
                }}
                margin="0 0 0 10px"
                display={{ base: 'none', sm: 'initial' }}
              >
                {data.title}
              </MotionBox>
            </Heading>
            <Box as="strong" className="highlighted" fontSize="35px" display={{ base: 'initial', sm: 'none' }}>
              {data.title}
            </Box>
            <Text fontSize="18px" fontWeight={700} pt="16px">
              {data.description}
            </Text>
            {data?.callToAction?.title && (
              <MotionButton whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} variant="default" fontSize="13px" m="25px 0" letterSpacing="0.05em" textTransform="uppercase">
                {data.callToAction.title}
              </MotionButton>
            )}
            {data?.bullets && (
              <Box as="ul" display="flex" flexDirection="column" gridGap="4px">
                {data.bullets.map((l) => (
                  <MotionBox whileHover={{ scale: 1.05 }} as="li" key={l.text} display="flex" fontSize="14px" gridGap="10px" alignItems="center">
                    <Icon icon={l.icon} width="14px" height="14px" />
                    {l.text}
                  </MotionBox>
                ))}
              </Box>
            )}
          </Box>
          <Box
            position="relative"
            display={{ base: 'none', md: 'initial' }}
            flex={0.5}
          >
            <MotionBox
              whileHover={{ scale: 1.3 }}
              position="absolute"
              left="85px"
              top="85px"
              borderRadius="50px"
            >
              <Avatar
                width="82px"
                height="82px"
                style={{ userSelect: 'none' }}
                src={avatars[3].picture}
              />
            </MotionBox>
          </Box>
        </Box>
        <Box p="30px 0">
          {data?.awards?.title && (
            <Heading as="h2" size="18px" pb="28px">
              {data.awards.title}
            </Heading>
          )}
          {data?.awards?.images && (
            <Box display="grid" gridRowGap="20px" alignItems="center" justifyItems="center" gridTemplateColumns="repeat(auto-fill, minmax(13rem, 1fr))">
              {data.awards.images.map((img, i) => (
                <Box key={img.src} width="auto" height="auto">
                  <Image key={img.src} src={img.src} width={img.width} height={img.height} alt={`image ${i}`} />
                </Box>
              ))}
            </Box>
          )}
        </Box>
        <Box display="flex" py="20px" alignItems="center" justifyContent={{ base: 'center', md: 'start' }}>
          <Box display="flex" flexDirection="column" gridGap="10px" flex={{ base: 0.6, md: 0.52 }} textAlign={{ base: 'center', md: 'left' }}>
            <Plx parallaxData={parallaxData}>
              <Heading as="h2" size="14px" letterSpacing="0.05em" color="blue.default">
                Meet students from all over the world
              </Heading>
              <Text fontSize="26px" fontWeight="700" lineHeight="30px">
                120 people took this course and 63 are online right now
              </Text>
              <Text fontSize="14px" fontWeight="400" lineHeight="24px" letterSpacing="0.05em" color={useColorModeValue('gray.700', 'gray.300')}>
                Some of our students are open to speak with others any time, by pressing
                this buttom you will be able to schedule a meeting with one of them
              </Text>
              <AnimatedButton mt="9px" alignSelf={{ base: 'center', md: 'start' }}>
                Meet developers in the making
              </AnimatedButton>
            </Plx>
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
                <Box position="absolute" width="80px" height="80px" right="180px" bottom="74px" background="blue.default" borderRadius={50} filter="blur(34px)" />
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
      </Container>
      <Box display="flex" p="8px 53px 0 53px" gridGap={51} background="linear-gradient(360deg, #EEF9FE 54.09%, rgba(238, 249, 254, 0) 100%)" alignItems="center" justifyContent={{ base: 'center', md: 'start' }}>
        <Box position="relative" flex={0.52} height="562px">
          <Avatar src={avatars[6].picture} width="147px" height="147px" position="absolute" left="0" top="85px" style={{ userSelect: 'none' }} alt={`${avatars[6].firstName}-${avatars[6].lastName}`} bg="transparent" />
          <Avatar src={avatars[3].picture} width="89px" height="89px" position="absolute" left="50px" bottom="136px" style={{ userSelect: 'none' }} alt={`${avatars[3].firstName}-${avatars[3].lastName}`} bg="transparent" />
          <Avatar src={avatars[10].picture} width="158px" height="158px" position="absolute" left="214px" top="142px" style={{ userSelect: 'none' }} alt={`${avatars[10].firstName}-${avatars[10].lastName}`} bg="transparent" />
          <Plx style={{ position: 'absolute', right: 0, top: 0 }} parallaxData={parallaxAvatars}>
            <Avatar src={avatars[5].picture} width="129px" height="129px" position="absolute" right="90px" top="59px" style={{ userSelect: 'none' }} alt={`${avatars[5].firstName}-${avatars[5].lastName}`} bg="transparent" />
          </Plx>
          <Avatar src={avatars[8].picture} width="137px" height="137px" position="absolute" right="51px" bottom="127px" style={{ userSelect: 'none' }} alt={`${avatars[8].firstName}-${avatars[8].lastName}`} bg="transparent" />
          <Avatar src={avatars[7].picture} width="109px" height="109px" position="absolute" right="0" top="172px" style={{ userSelect: 'none' }} alt={`${avatars[7].firstName}-${avatars[7].lastName}`} bg="transparent" />
        </Box>

        <Box display="flex" flexDirection="column" gridGap="10px" flex={{ base: 0.6, md: 0.32 }} textAlign={{ base: 'center', md: 'left' }}>
          <Heading as="h2" size="14px" letterSpacing="0.05em" color="blue.default">
            We support you in your journey, wherever you are
          </Heading>
          <Text fontSize="26px" fontWeight="700" lineHeight="30px">
            There are +6 mentors online and available right now.
          </Text>
          <Text fontSize="14px" fontWeight="400" lineHeight="24px" letterSpacing="0.05em" color={useColorModeValue('gray.700', 'gray.300')}>
            Some of our students are open to speak with others any time, by pressing
            this buttom you will be able to schedule a meeting with one of them
          </Text>
          <AnimatedButton mt="9px" alignSelf={{ base: 'center', md: 'start' }}>
            Schedule a mentoring session
          </AnimatedButton>
          <Text fontSize="14px" fontWeight="700" letterSpacing="0.05em" mt="17px">
            Clic any mentor for more information
          </Text>
          <Box display={{ base: 'none', sm: 'flex' }} position="relative" bottom="4px" left="-110px">
            <Icon icon="leftArrow" width="200px" height="39px" />
          </Box>
        </Box>
      </Box>

      <Container maxW="container.xl" display="flex" py="24px" height="458px" alignItems="center" gridGap={51}>
        <Box display="flex" flexDirection="column" gridGap="10px" flex={{ base: 0.6, md: 0.38 }} textAlign={{ base: 'center', md: 'left' }}>
          <Heading as="h2" size="14px" letterSpacing="0.05em" mb="8px" color="blue.default">
            We take online education to another level.
          </Heading>
          <Text fontSize="26px" fontWeight="700" lineHeight="30px">
            Live clases, coding sessions, workshops and hangouts every few hours
          </Text>
          <Text fontSize="14px" fontWeight="400" lineHeight="24px" mt="10px" letterSpacing="0.05em" color={useColorModeValue('gray.700', 'gray.300')}>
            During the pre-work you learn some basic CSS and HTML, and hopefully how to use
            the flex-box to create simple layouts.
          </Text>
          <AnimatedButton mt="9px" alignSelf={{ base: 'center', md: 'start' }}>
            Join the next event
          </AnimatedButton>
        </Box>

        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" gridGap="40px" flex={0.5} width="592px" bg="blue.light" height="100%">
          <Box display="flex" p="10px" w="236px" alignItems="center" gridGap="8.5px" borderRadius="50px" background="blue.light" border="2px solid" borderColor="blue.default">
            <Box background="#eb3422" p="8px" borderRadius="50px" alignSelf="center">
              <Icon icon="youtube" width="30px" color="#000" height="30px" />
            </Box>
            <Box display="flex" flexDirection="column">
              <Box fontSize="11px" letterSpacing="0.05em" fontWeight="900">
                Today’s live class
              </Box>
              <Box fontSize="10px" letterSpacing="0.05em" fontWeight="700">
                Started 40 mins ago
              </Box>
            </Box>
          </Box>

          <Box display="flex" p="10px" w="190px" alignItems="center" gridGap="8.5px" borderRadius="50px" background="blue.light" border="2px solid" borderColor="blue.default">
            <Box background="#FFB718" p="7px" borderRadius="50px" alignSelf="center">
              <Icon icon="code" width="30px" color="#fff" height="30px" />
            </Box>
            <Box display="flex" flexDirection="column">
              <Box fontSize="11px" letterSpacing="0.05em" fontWeight="900">
                Coding Jamming
              </Box>
              <Box fontSize="10px" letterSpacing="0.05em" fontWeight="700">
                Starts in 40 mins
              </Box>
            </Box>
          </Box>

          <Box display="flex" p="10px" w="190px" alignItems="center" gridGap="8.5px" borderRadius="50px" background="blue.light" border="2px solid" borderColor="blue.default">
            <Box background="#25BF6C" p="7px" borderRadius="50px" alignSelf="center">
              <Icon icon="people" width="30px" color="#000" height="30px" />
            </Box>
            <Box display="flex" flexDirection="column">
              <Box fontSize="11px" letterSpacing="0.05em" fontWeight="900">
                Coding Worshop
              </Box>
              <Box fontSize="10px" letterSpacing="0.05em" fontWeight="700">
                Starts in 40 mins
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>

      <Container maxW="container.xl" display="flex" py="24px" height="458px" alignItems="center" gridGap={51}>
        <Box flex={0.5} width="592px" bg="blue.light" height="100%">
          content
        </Box>
        <Box display="flex" flexDirection="column" gridGap="20px" flex={{ base: 0.6, md: 0.45 }} textAlign={{ base: 'center', md: 'left' }}>
          <Heading as="h2" size="14px" letterSpacing="0.05em" color="blue.default">
            Take a look at the most relevant modules of our coding bootcamp
          </Heading>
          <Text fontSize="26px" fontWeight="700" lineHeight="30px">
            HTML/CSS
          </Text>
          <Text fontSize="14px" fontWeight="400" lineHeight="24px" letterSpacing="0.05em" color={useColorModeValue('gray.700', 'gray.300')}>
            {`During the pre-work you learn some basic CSS and HTML, and hopefully how to use the
            flex-box to create simple layouts. The first day we will review the pre-work completion
            and introduce a more evolved CSS that enables amazing layouts and the amazing Bootstrap
            framework that will make you life so much easier with the "component oriented" approach.`}
          </Text>
          <AnimatedButton alignSelf={{ base: 'center', md: 'start' }}>
            Enroll now
          </AnimatedButton>
        </Box>
      </Container>

      <Box bg="black" width="100%" height="300px">
        rest of content
      </Box>
    </Box>
  );
};

CodingIntroduction.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
};
AnimatedButton.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  key: PropTypes.string,
  toUppercase: PropTypes.bool,
  rest: PropTypes.arrayOf(PropTypes.any),
};
AnimatedButton.defaultProps = {
  key: '1',
  toUppercase: false,
  rest: [],
};

export default CodingIntroduction;

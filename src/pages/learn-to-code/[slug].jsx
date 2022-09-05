/* eslint-disable max-len */
import {
  Avatar, Box, Button, Container, Tab, TabList, TabPanel, TabPanels, Tabs,
  Text, useColorModeValue, useMediaQuery,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { useState } from 'react';
import Plx from 'react-plx';
import Heading from '../../common/components/Heading';
import Icon from '../../common/components/Icon';
import { getDataContentSlugs, getDataContentProps } from '../../utils/file';

export const getStaticPaths = async ({ locales }) => {
  const paths = getDataContentSlugs('public/locales/en/learn-to-code', locales);

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = async ({ params, locale }) => {
  const { slug } = params;
  console.log('locale');

  const data = getDataContentProps(
    `public/locales/${locale}/learn-to-code`,
    slug,
  );

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

const parallax1 = [
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
const parallax2 = [
  {
    start: 400,
    end: 800,
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
const parallaxAvatars2 = [
  {
    start: 300,
    end: 800,
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
const MotionAvatar = motion(Avatar);

const AnimatedButton = ({
  children, onClick, toUppercase, rest,
}) => (
  <MotionButton whileHover={{ scale: 1.05 }} whileTap={{ scale: 1 }} variant="default" onClick={onClick} {...rest} fontSize="13px" m="25px 0" width="fit-content" letterSpacing="0.05em" textTransform={toUppercase ? 'uppercase' : ''}>
    {children}
  </MotionButton>
);
const AnimatedAvatar = ({
  src, width, height, top, bottom, left, right, style,
}) => (
  <MotionAvatar whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} src={src} width={width} height={height} style={{ ...style, userSelect: 'none' }} left={left} right={right} top={top} bottom={bottom} position="absolute" bg="transparent" />
);

const CustomTab = ({
  children, onClick, top, bottom, left, right, style,
}) => (
  <Tab _selected={{ backgroundColor: 'blue.default', color: 'white' }} style={style} p="20px 0" width="178px" fontSize="15px" background="blue.light" color="blue.default" onClick={onClick} textTransform="uppercase" position="absolute" left={left} right={right} top={top} bottom={bottom} borderRadius="22px" fontWeight="700">
    {children}
  </Tab>
);

const CodingIntroduction = ({ data }) => {
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [isBelowTablet] = useMediaQuery('(max-width: 768px)');
  const router = useRouter();

  return (
    <Box pt="3rem">
      {/* maxW="container.xl" */}
      <Container maxW="container.xl">
        <Box display="flex">
          <Box flex={1}>
            <Heading as="h1" size="xl" fontWeight="700">
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
            <Heading as="h2" size="18px" mb="28px">
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
          <Box display="flex" flexDirection="column" flex={{ base: 0.6, md: 0.52 }} textAlign={{ base: 'center', md: 'left' }}>
            <Plx parallaxData={parallax1}>
              <Heading as="h2" size="14px" letterSpacing="0.05em" mb="10px" color="blue.default">
                {data.students.title}
              </Heading>
              <Text fontSize="26px" fontWeight="700" mb="10px" lineHeight="30px">
                {data.students.subTitle}
              </Text>
              <Text dangerouslySetInnerHTML={{ __html: data.students.description }} fontSize="14px" fontWeight="400" lineHeight="24px" letterSpacing="0.05em" color={useColorModeValue('gray.700', 'gray.300')} />
              <AnimatedButton onClick={() => router.push(data.students.button.link)} mt="9px" alignSelf={{ base: 'center', md: 'start' }}>
                {data.students.button.title}
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
          <Plx style={{ position: 'absolute', left: 0, top: 0 }} parallaxData={parallaxAvatars2}>
            <AnimatedAvatar src={avatars[6].picture} width="147px" height="147px" position="absolute" left="0" top="85px" alt={`${avatars[6].firstName}-${avatars[6].lastName}`} />
            <AnimatedAvatar src={avatars[10].picture} style={{ border: '4px solid #0097CF' }} width="158px" height="158px" position="absolute" left="214px" top="142px" alt={`${avatars[10].firstName}-${avatars[10].lastName}`} />
          </Plx>
          <AnimatedAvatar src={avatars[3].picture} width="89px" height="89px" position="absolute" left="50px" bottom="136px" alt={`${avatars[3].firstName}-${avatars[3].lastName}`} />
          <Plx style={{ position: 'absolute', right: 0, top: 0 }} parallaxData={parallaxAvatars2}>
            <AnimatedAvatar src={avatars[5].picture} width="129px" height="129px" position="absolute" right="90px" top="59px" alt={`${avatars[5].firstName}-${avatars[5].lastName}`} />
            <AnimatedAvatar src={avatars[7].picture} width="109px" height="109px" position="absolute" right="0" top="172px" alt={`${avatars[7].firstName}-${avatars[7].lastName}`} />
          </Plx>
          <AnimatedAvatar src={avatars[8].picture} width="137px" height="137px" position="absolute" right="51px" bottom="127px" alt={`${avatars[8].firstName}-${avatars[8].lastName}`} />
        </Box>

        <Box display="flex" flexDirection="column" flex={{ base: 0.6, md: 0.32 }} textAlign={{ base: 'center', md: 'left' }}>
          <Plx parallaxData={parallax2}>
            <Heading as="h2" size="14px" mb="10px" letterSpacing="0.05em" color="blue.default">
              {data.mentors.title}
            </Heading>
            <Text fontSize="26px" fontWeight="700" lineHeight="30px" mb="10px">
              {data.mentors.subTitle}
            </Text>
            <Text dangerouslySetInnerHTML={{ __html: data.mentors.description }} fontSize="14px" fontWeight="400" lineHeight="24px" letterSpacing="0.05em" color={useColorModeValue('gray.700', 'gray.300')} />
            <AnimatedButton onClick={() => router.push(data.mentors.button.link)} mt="9px" alignSelf={{ base: 'center', md: 'start' }}>
              {data.mentors.button.title}
            </AnimatedButton>
            <Text fontSize="14px" fontWeight="700" letterSpacing="0.05em" mt="17px">
              {data.mentors.hint}
            </Text>
            <Box display={{ base: 'none', sm: 'flex' }} position="relative" bottom="0" left="-110px">
              <Icon icon="leftArrow" width="200px" height="39px" />
            </Box>
          </Plx>
        </Box>
      </Box>

      <Container maxW="container.xl" display="flex" py="24px" height="458px" alignItems="center" gridGap={51}>
        <Box display="flex" flexDirection="column" gridGap="10px" flex={{ base: 0.6, md: 0.38 }} textAlign={{ base: 'center', md: 'left' }}>
          <Heading as="h2" size="14px" letterSpacing="0.05em" mb="8px" color="blue.default">
            {data.events.title}
          </Heading>
          <Text fontSize="26px" fontWeight="700" lineHeight="30px">
            {data.events.subTitle}
          </Text>
          <Text dangerouslySetInnerHTML={{ __html: data.events.description }} fontSize="14px" fontWeight="400" lineHeight="24px" mt="10px" letterSpacing="0.05em" color={useColorModeValue('gray.700', 'gray.300')} />
          <AnimatedButton onClick={() => router.push(data.events.button.link)} mt="9px" alignSelf={{ base: 'center', md: 'start' }}>
            {data.events.button.title}
          </AnimatedButton>
        </Box>

        <Box display="flex" position="relative" flexDirection="column" justifyContent="center" alignItems="center" gridGap="40px" flex={0.5} width="592px" height="100%">
          <Box position="absolute" className="pulse-yellow" top="140px" left="0" background="yellow.default" p="14px" borderRadius="50px">
            <Icon icon="code" width="47px" height="47px" color="#fff" />
          </Box>
          <Box position="absolute" className="pulse-green" top="100px" left="120px" background="success" p="8px" borderRadius="50px">
            <Icon icon="people" width="17px" height="17px" color="#fff" />
          </Box>
          <Box position="absolute" className="pulse-green2" bottom="0px" left="90px" background="success" p="14px" borderRadius="50px">
            <Icon icon="people" width="47px" height="47px" color="#fff" />
          </Box>

          <Box position="absolute" className="pulse-green2" top="0px" right="90px" background="success" p="14px" borderRadius="50px">
            <Icon icon="people" width="47px" height="47px" color="#fff" />
          </Box>
          <Box position="absolute" className="pulse-green2" top="120px" right="40px" background="success" p="10px" borderRadius="50px">
            <Icon icon="people" width="27px" height="27px" color="#fff" />
          </Box>
          <Box position="absolute" className="pulse-yellow" top="160px" right="150px" background="yellow.default" p="6px" borderRadius="50px">
            <Icon icon="code" width="22px" height="22px" color="#fff" />
          </Box>
          <Box position="absolute" className="pulse-yellow" bottom="40px" right="80px" background="yellow.default" p="14px" borderRadius="50px">
            <Icon icon="code" width="47px" height="47px" color="#fff" />
          </Box>
          <Box display="flex" p="10px" w="236px" alignItems="center" gridGap="8.5px" borderRadius="50px" background="blue.light" border="2px solid" borderColor="blue.default" zIndex={5}>
            <Box className="pulse-red" background="#eb3422" p="8px" borderRadius="50px" alignSelf="center">
              <Icon icon="youtube" width="30px" color="#FFF" height="30px" />
            </Box>
            <Box display="flex" flexDirection="column">
              <Box fontSize="11px" letterSpacing="0.05em" fontWeight="900">
                {data?.events?.live?.title}
              </Box>
              <Box fontSize="10px" letterSpacing="0.05em" fontWeight="700">
                Started 40 mins ago
              </Box>
            </Box>
          </Box>

          <Box display="flex" className="pulse-blue" p="10px" w="190px" alignItems="center" gridGap="8.5px" borderRadius="50px" background="blue.light" border="2px solid" borderColor="blue.default" zIndex={5}>
            <Box background="#FFB718" p="7px" borderRadius="50px" alignSelf="center">
              <Icon icon="code" width="30px" color="#fff" height="30px" />
            </Box>
            <Box display="flex" flexDirection="column">
              <Box fontSize="11px" letterSpacing="0.05em" fontWeight="900">
                {data?.events?.coding?.title}
              </Box>
              <Box fontSize="10px" letterSpacing="0.05em" fontWeight="700">
                Starts in 40 mins
              </Box>
            </Box>
          </Box>

          <Box display="flex" className="pulse-blue" p="10px" w="190px" alignItems="center" gridGap="8.5px" borderRadius="50px" background="blue.light" border="2px solid" borderColor="blue.default" zIndex={5}>
            <Box background="#25BF6C" p="7px" borderRadius="50px" alignSelf="center">
              <Icon icon="people" width="30px" color="#FFf" height="30px" />
            </Box>
            <Box display="flex" flexDirection="column">
              <Box fontSize="11px" letterSpacing="0.05em" fontWeight="900">
                {data?.events?.workshop?.title}
              </Box>
              <Box fontSize="10px" letterSpacing="0.05em" fontWeight="700">
                Starts in 40 mins
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>

      <Box maxW="container.xl" m="3rem 0 3rem 0" height="auto" position="relative" alignItems="center" gridGap={51}>
        <Box position="absolute" top="-90px" left="340px">
          <Icon icon="curvedLine" width="80px" height="654px" />
        </Box>
        <Tabs index={currentTabIndex} variant="unstyled" display="flex" height="528px" alignItems="center">
          <TabList position="relative" w="400px" flex={0.6} width="592px" height="100%">
            {data?.previewModules?.list[0]?.title && (
              <CustomTab onClick={() => setCurrentTabIndex(0)} top="20px" left="250px">
                {data?.previewModules?.list[0]?.title}
              </CustomTab>
            )}

            {data?.previewModules?.list[1]?.title && (
              <CustomTab onClick={() => setCurrentTabIndex(1)} top="107px" left="290px">
                {data?.previewModules?.list[1]?.title}
              </CustomTab>
            )}
            {data?.previewModules?.list[2]?.title && (
              <CustomTab onClick={() => setCurrentTabIndex(2)} top="204px" left="330px">
                {data?.previewModules?.list[2]?.title}
              </CustomTab>
            )}
            {data?.previewModules?.list[3]?.title && (
              <CustomTab onClick={() => setCurrentTabIndex(3)} bottom="164px" left="310px">
                {data?.previewModules?.list[3]?.title}
              </CustomTab>
            )}

            <CustomTab onClick={() => router.push('#more-content')} style={{ border: '3px solid #0097CD' }} bottom="57px" left="280px">
              {data?.previewModules?.moreContent}
            </CustomTab>

          </TabList>
          <TabPanels flex={{ base: 0.6, md: 0.45 }}>
            {/* flex={{ base: 0.6, md: 0.45 }} */}
            {data?.previewModules?.list?.map((module) => (
              <TabPanel key={module.title} display="flex" flexDirection="column" gridGap="20px" style={{ flex: 0.5 }} textAlign={{ base: 'center', md: 'left' }}>
                <Heading as="h2" size="14px" letterSpacing="0.05em" color="blue.default">
                  {data?.previewModules.title}
                </Heading>
                <Text fontSize="26px" fontWeight="700" lineHeight="30px">
                  {module.title}
                </Text>
                <Text
                  fontSize="14px"
                  fontWeight="400"
                  lineHeight="24px"
                  letterSpacing="0.05em"
                  color={useColorModeValue('gray.700', 'gray.300')}
                  dangerouslySetInnerHTML={{ __html: module.description }}
                />
                <AnimatedButton onClick={() => router.push('#apply')} alignSelf={{ base: 'center', md: 'start' }}>
                  {data?.previewModules.button.title}
                </AnimatedButton>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </Box>
      {/* <Container maxW="container.xl" display="flex" p="3rem 0 3rem 0" height="528px" alignItems="center" gridGap={51}>
        <Box position="relative" flex={0.5} width="592px" bg="blue.light" height="100%">
          <Box position="absolute" top="-110px" left="240px">
            <Icon icon="curvedLine" width="80px" height="654px" />
          </Box>
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
      </Container> */}

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
  onClick: PropTypes.func,
};
AnimatedAvatar.propTypes = {
  src: PropTypes.string,
  height: PropTypes.string,
  width: PropTypes.string,
  left: PropTypes.string,
  right: PropTypes.string,
  top: PropTypes.string,
  bottom: PropTypes.string,
  style: PropTypes.objectOf(PropTypes.any),
};
CustomTab.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  left: PropTypes.string,
  right: PropTypes.string,
  top: PropTypes.string,
  bottom: PropTypes.string,
  onClick: PropTypes.func,
  style: PropTypes.objectOf(PropTypes.any),
};

CustomTab.defaultProps = {
  left: '',
  right: '',
  top: '',
  bottom: '',
  onClick: () => {},
  style: {},
};
AnimatedButton.defaultProps = {
  key: '1',
  toUppercase: false,
  rest: [],
  onClick: () => {},
};
AnimatedAvatar.defaultProps = {
  src: '',
  width: '',
  height: '',
  left: '',
  right: '',
  top: '',
  bottom: '',
  style: {},
};

export default CodingIntroduction;

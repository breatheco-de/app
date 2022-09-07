/* eslint-disable object-curly-newline */
import {
  Avatar, Box, Button, Container, Link, Tab, TabList, TabPanel, TabPanels, Tabs,
  Text, useColorModeValue, useMediaQuery,
} from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import Plx from 'react-plx';
import axios from 'axios';
import Heading from '../../common/components/Heading';
import Icon from '../../common/components/Icon';
import { getDataContentProps } from '../../utils/file';
import {
  avatars, parallax4, parallax5, parallaxAvatars, parallaxAvatars2,
} from '../../lib/landing-props';

export const getStaticProps = async ({ locale }) => {
  const data = getDataContentProps(
    `public/locales/${locale}`,
    'learn-to-code',
  );

  return {
    props: {
      data,
    },
  };
};

const MotionBox = motion(Box);
const MotionButton = motion(Button);
const MotionAvatar = motion(Avatar);

const AnimatedButton = ({
  children, onClick, toUppercase, rest,
}) => (
  <MotionButton whileHover={{ scale: 1.05 }} whileTap={{ scale: 1 }} variant="default" onClick={onClick} {...rest} fontSize="13px" m="20px 0" width="fit-content" letterSpacing="0.05em" textTransform={toUppercase ? 'uppercase' : ''}>
    {children}
  </MotionButton>
);
const AnimatedAvatar = ({
  src, width, height, top, bottom, left, right, style, onClick,
}) => (
  <MotionAvatar whileHover={{ scale: 1.05 }} onClick={onClick} whileTap={{ scale: 0.95 }} src={src} width={width} height={height} style={{ ...style, userSelect: 'none' }} left={left} right={right} top={top} bottom={bottom} position="absolute" bg="transparent" zIndex={2} />
);

const CustomTab = ({
  children, onClick, top, bottom, left, right, style,
}) => (
  <Tab _selected={{ backgroundColor: 'blue.default', color: 'white' }} style={style} p="20px 0" width="178px" fontSize="15px" background="blue.light" color="blue.default" onClick={onClick} textTransform="uppercase" position="absolute" left={left} right={right} top={top} bottom={bottom} borderRadius="22px" fontWeight="700">
    {children}
  </Tab>
);

const ShadowCard = ({ data, style, index, ...rest }) => (
  <MotionBox position="absolute" boxShadow="lg" {...rest} style={style} display="flex" flexDirection="column" borderRadius="8px" background="white" zIndex={0} initial="hidden" animate="visible" exit="hidden" layoutId={`${index}-${data.fullNameSlug}`} transition={{ duration: 0.4 }}>
    <MotionBox color="black" fontSize="15px" fontWeight="900" textAlign="center">
      {data.fullName}
    </MotionBox>
    <Box color="black" fontSize="15px" fontWeight="400" textAlign="center" letterSpacing="0.05em">
      {data?.workPosition || 'Ceo @ Globant'}
    </Box>
    <Link href="#schedule" variant="default" fontSize="15px" fontWeight="700" letterSpacing="0.05em" textAlign="center">
      Schedule a mentoring session
    </Link>
  </MotionBox>
);

const CodingIntroduction = ({ data }) => {
  const featuredColors = useColorModeValue('featuredLight', 'featuredDark');
  const fadeOutBackground = useColorModeValue('#EEF9FE', '#2D3748');
  const colors = useColorModeValue('#000', '#fff');
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [users, setUsers] = useState(null);
  const [avatarIndex, setAvatarIndex] = useState(1);
  const [isBelowTablet] = useMediaQuery('(max-width: 768px)');
  const router = useRouter();

  useEffect(() => {
    axios.get(`${process.env.BREATHECODE_HOST}/v1/admissions/public/cohort/user?syllabus=coding-introduction&roles=TEACHER,ASSISTANT`)
      .then((res) => {
        const filterWithImages = res.data.filter(
          (l) => l.user.profile && l.user.profile?.avatar_url,
        );
        return setUsers(filterWithImages);
      })
      .catch(() => {});
  }, []);

  const getUser = (user) => {
    const fullName = `${user?.first_name} ${user?.last_name}`;
    const fullNameSlug = `${user?.first_name}-${user?.last_name}`;
    const avatarUrl = user?.profile?.avatar_url;

    return { fullName, fullNameSlug, avatarUrl };
  };

  return (
    <Box pt="3rem">
      {/* maxW="container.xl" */}
      <Container maxW="container.xl">
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
          <Box
            position="relative"
            display={{ base: 'none', md: 'initial' }}
            flex={0.5}
          >
            {users && (
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
                  src={getUser(users[6]?.user).avatarUrl}
                />
              </MotionBox>
            )}
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
          <Box display="flex" flexDirection="column" flex={{ base: 1, md: 0.52 }} textAlign={{ base: 'center', md: 'left' }}>
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
                <MotionBox position="absolute" width="80px" height="80px" right="180px" bottom="74px" background="blue.default" borderRadius={50} filter="blur(34px)" transition={{ duration: 3, repeat: Infinity }} animate={{ right: ['172px', '180px', '188px', '172px'], bottom: ['64px', '74px', '78px', '64px'], scale: [1, 1.2, 1.2, 1], filter: ['blur(30px)', 'blur(34px)', 'blur(34px)', 'blur(30px)'] }} />
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
      <Box display="flex" p={{ base: '8px 23px 0 23px', md: '8px 53px 0 53px' }} height="100%" gridGap={51} background={`linear-gradient(360deg, ${fadeOutBackground} 54.09%, rgba(238, 249, 254, 0) 100%)`} alignItems="center" justifyContent={{ base: 'center', md: 'start' }}>
        {!isBelowTablet && users && (
          <Box position="relative" flex={{ base: 1, md: 0.52 }} height={{ base: '350px', md: '562px' }}>
            <Plx
              style={{
                position: 'absolute', left: 0, top: 0, zIndex: 1,
              }}
              parallaxData={parallaxAvatars2}
            >
              <AnimatedAvatar src={getUser(users[9]?.user).avatarUrl} onClick={() => setAvatarIndex(0)} width="147px" height="147px" position="absolute" left="0" top="85px" alt={getUser(users[9]?.user).fullNameSlug} />
              <AnimatedAvatar src={getUser(users[10]?.user).avatarUrl} onClick={() => setAvatarIndex(1)} style={{ border: '4px solid #0097CF' }} width="158px" height="158px" position="absolute" left="214px" top="142px" alt={getUser(users[10]?.user).fullNameSlug} zIndex={2} />
            </Plx>
            <AnimatedAvatar src={getUser(users[3]?.user).avatarUrl} onClick={() => setAvatarIndex(2)} width="89px" height="89px" position="absolute" left="50px" bottom="136px" alt={getUser(users[3]?.user).fullNameSlug} />
            <Plx
              style={{
                position: 'absolute', right: 0, top: 0, zIndex: 1,
              }}
              parallaxData={parallaxAvatars2}
            >
              <AnimatedAvatar src={getUser(users[5]?.user).avatarUrl} onClick={() => setAvatarIndex(3)} width="129px" height="129px" position="absolute" right="90px" top="59px" alt={getUser(users[5]?.user).fullNameSlug} />
            </Plx>
            <AnimatedAvatar src={getUser(users[7]?.user).avatarUrl} onClick={() => setAvatarIndex(4)} width="109px" height="109px" position="absolute" right="0" top="172px" alt={getUser(users[7]?.user).fullNameSlug} style={{ zIndex: avatarIndex === 3 ? 0 : 2 }} />
            <AnimatedAvatar src={getUser(users[8]?.user).avatarUrl} onClick={() => setAvatarIndex(5)} width="137px" height="137px" position="absolute" right="51px" bottom="127px" alt={getUser(users[8]?.user).fullNameSlug} style={{ zIndex: avatarIndex === 4 ? 0 : 1 }} />

            <AnimatePresence>
              {avatarIndex === 0 && (<ShadowCard index={1} data={getUser(users[9]?.user)} left="-40px" top="205px" width="228px" p="30px 10px 2px 10px" gridGap="2px" height="138px" />)}
              {avatarIndex === 1 && (<ShadowCard index={2} data={getUser(users[10]?.user)} left="168px" top="252px" width="258px" pt="60px" gridGap="10px" height="168px" />)}
              {avatarIndex === 2 && (<ShadowCard index={3} data={getUser(users[3]?.user)} left="-10px" bottom="15px" width="218px" p="35px 10px 10px 10px" gridGap="2px" height="142px" />)}
              {avatarIndex === 3 && (<ShadowCard index={4} data={getUser(users[5]?.user)} right="48px" top="158px" width="218px" p="38px 10px 10px 10px" gridGap="2px" height="142px" />)}
              {avatarIndex === 4 && (<ShadowCard index={5} data={getUser(users[7]?.user)} right="-50px" top="252px" width="218px" p="38px 10px 10px 10px" gridGap="2px" height="142px" style={{ zIndex: 1 }} />)}
              {avatarIndex === 5 && (<ShadowCard index={6} data={getUser(users[8]?.user)} right="10px" bottom="15px" width="218px" p="38px 10px 10px 10px" gridGap="2px" height="142px" style={{ zIndex: 0 }} />)}
            </AnimatePresence>
          </Box>
        )}

        <Box display="flex" flexDirection="column" flex={{ base: 1, md: 0.32 }} textAlign={{ base: 'center', md: 'left' }}>
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
          <Text display={{ base: 'none', md: 'inherit' }} fontSize="14px" fontWeight="700" letterSpacing="0.05em" mt="17px">
            {data.mentors.hint}
          </Text>
          {!isBelowTablet && (
            <Box display={{ base: 'none', sm: 'flex' }} position="relative" bottom="0" left="-110px">
              <Icon icon="leftArrow" width="200px" height="39px" />
            </Box>
          )}
        </Box>
      </Box>

      <Container maxW="container.xl" height={{ base: '100%', md: '458px' }} display="flex" flexDirection={{ base: 'column', md: 'row' }} mt={{ base: '40px', md: 0 }} py="24px" alignItems="center" gridGap={51}>
        <Box display="flex" flexDirection="column" gridGap="10px" flex={{ base: 1, md: 0.38 }} textAlign={{ base: 'center', md: 'left' }}>
          <Heading as="h2" size="14px" letterSpacing="0.05em" mb="8px" color="blue.default">
            {data.events.title}
          </Heading>
          <Text fontSize="26px" fontWeight="700" lineHeight="30px">
            {data.events.subTitle}
          </Text>
          <Text dangerouslySetInnerHTML={{ __html: data.events.description }} fontSize="14px" fontWeight="400" lineHeight="24px" mt="10px" letterSpacing="0.05em" color={useColorModeValue('gray.700', 'gray.300')} />
          <AnimatedButton onClick={() => router.push(data.events.button.link)} alignSelf={{ base: 'center', md: 'start' }}>
            {data.events.button.title}
          </AnimatedButton>
        </Box>

        <Box display="flex" position="relative" flexDirection="column" justifyContent="center" alignItems="center" gridGap="40px" flex={0.5} width={{ base: '100%', md: '592px' }} height="100%">
          <Box position="absolute" className="pulse-yellow" top="140px" left="0" background="yellow.default" p="14px" borderRadius="50px" filter={{ base: 'blur(4px)', md: 'blur(0px)' }}>
            <Icon icon="code" width="47px" height="47px" color="#fff" />
          </Box>
          <Box position="absolute" className="pulse-green" top="100px" left="120px" background="success" p="8px" borderRadius="50px" filter={{ base: 'blur(4px)', md: 'blur(0px)' }}>
            <Icon icon="community" width="17px" height="17px" color="#fff" />
          </Box>
          <Box position="absolute" className="pulse-green2" bottom="0px" left="90px" background="success" p="14px" borderRadius="50px" filter={{ base: 'blur(4px)', md: 'blur(0px)' }}>
            <Icon icon="community" width="47px" height="47px" color="#fff" />
          </Box>

          <Box position="absolute" className="pulse-green2" top="0px" right="90px" background="success" p="14px" borderRadius="50px" filter={{ base: 'blur(4px)', md: 'blur(0px)' }}>
            <Icon icon="community" width="47px" height="47px" color="#fff" />
          </Box>
          <Box position="absolute" className="pulse-green2" top="120px" right="40px" background="success" p="10px" borderRadius="50px" filter={{ base: 'blur(4px)', md: 'blur(0px)' }}>
            <Icon icon="community" width="27px" height="27px" color="#fff" />
          </Box>
          <Box position="absolute" className="pulse-yellow" top="160px" right="150px" background="yellow.default" p="6px" borderRadius="50px" filter={{ base: 'blur(4px)', md: 'blur(0px)' }}>
            <Icon icon="code" width="22px" height="22px" color="#fff" />
          </Box>
          <Box position="absolute" className="pulse-yellow" bottom="40px" right="80px" background="yellow.default" p="14px" borderRadius="50px" filter={{ base: 'blur(4px)', md: 'blur(0px)' }}>
            <Icon icon="code" width="47px" height="47px" color="#fff" />
          </Box>
          <Box display="flex" p="10px" w="236px" alignItems="center" gridGap="8.5px" borderRadius="50px" background={featuredColors} border="2px solid" borderColor="blue.default" zIndex={5}>
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

          <Box display="flex" className="pulse-blue" p="10px" w="190px" alignItems="center" gridGap="8.5px" borderRadius="50px" background={featuredColors} border="2px solid" borderColor="blue.default" zIndex={5}>
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

          <Box display="flex" className="pulse-blue" p="10px" w="190px" alignItems="center" gridGap="8.5px" borderRadius="50px" background={featuredColors} border="2px solid" borderColor="blue.default" zIndex={5}>
            <Box background="#25BF6C" p="7px" borderRadius="50px" alignSelf="center">
              <Icon icon="community" width="30px" color="#FFf" height="30px" />
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

      <Box maxW="container.xl" m="3rem 0 3rem 0" display="flex" flexDirection={{ base: 'column', md: 'row' }} height="auto" position="relative" alignItems="center" gridGap={51}>
        <Box display={{ base: 'none', md: 'inherit' }} position="absolute" top="-90px" left="340px">
          <Icon icon="curvedLine" width="80px" height="654px" />
        </Box>
        <Plx parallaxData={parallax4}>
          <Tabs index={currentTabIndex} variant="unstyled" display="flex" flexDirection={{ base: 'column', md: 'row' }} height={{ base: '100%', md: '528px' }} mt={{ base: '40px', md: 0 }} alignItems="center">
            <TabList position="relative" w="400px" flex={0.6} display={{ base: 'none', md: 'inherit' }} width="592px" height="100%">
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
                <TabPanel key={module.title} display="flex" flexDirection="column" alignItems={{ base: 'center', md: 'inherit' }} gridGap="20px" style={{ flex: 0.5 }} textAlign={{ base: 'center', md: 'left' }}>
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
        </Plx>
      </Box>
      <Box display="flex" flexDirection="column" justifyContent="center" py="20px" height="100%" alignItems="center" gridGap={51}>
        <Heading>
          {data?.pricing?.title}
        </Heading>
        <Plx parallaxData={parallax5}>

          <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} gridGap="21px">
            {data?.pricing?.list.map((item) => (
              <Box key={item.title} display="flex" flexDirection="column" justifyContent="space-between" background={item.type === 'pro' ? 'blue.default' : 'blue.light'} color={item.type === 'pro' ? 'white' : 'black'} border="1px solid" borderColor="#0097CD" p="23px" borderRadius="16px" w="300px">
                <Box width="100%">
                  <Box fontSize="26px" fontWeight="700" mb="6px">
                    {item.title}
                  </Box>
                  <Box display="flex" fontWeight="400">
                    <Box fontSize="36px">
                      {item.subTitle}
                    </Box>
                    {item.type === 'pro' && (
                      <Box fontSize="18px" mt="10px" pt="10px">
                        / month
                      </Box>
                    )}
                  </Box>
                  {item?.description && (
                    <Text fontSize={item.type === 'pro' ? '16px' : '13px'} fontWeight="700" textTransform="uppercase" dangerouslySetInnerHTML={{ __html: item?.description }} />
                  )}
                  <Box as="hr" my="11px" background="currentColor" height="1.2px" />
                  <Box display="flex" flexDirection="column" gridGap="10px">
                    <Box fontSize="13px" textTransform="uppercase" fontWeight="700">
                      {item?.bullets?.title}
                    </Box>
                    <Box as="ul" style={{ listStyle: 'none' }} display="flex" flexDirection="column" gridGap="12px">
                      {item?.bullets?.list.map((bullet) => (
                        <Box as="li" key={bullet?.title} display="flex" flexDirection="row" lineHeight="24px" gridGap="6px">
                          <Icon icon="checked2" color={item.type === 'pro' ? '#FFFFFF' : '#0097CD'} width="12px" height="9px" style={{ margin: '8px 0 0 0' }} />
                          <Box fontSize="14px" fontWeight="600" letterSpacing="0.05em">
                            {bullet?.title}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
                <Box w="100%" display="flex" justifyContent="center" mt="16px">
                  <Button background={item.type === 'pro' ? '#FFFFFF' : '#0097CD'} color={item.type === 'pro' ? '#0097CD' : '#FFFFFF'} _active={{ opacity: 0.8 }} _hover={{ opacity: 0.9 }} onClick={() => router.push(item?.button?.link)}>
                    {item?.button?.title}
                  </Button>
                </Box>
              </Box>
            ))}

          </Box>
        </Plx>
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
  onClick: PropTypes.func,
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
ShadowCard.propTypes = {
  data: PropTypes.objectOf(PropTypes.any),
  style: PropTypes.objectOf(PropTypes.any),
  index: PropTypes.number,
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
  onClick: () => {},
};
ShadowCard.defaultProps = {
  data: {},
  style: {},
  index: 0,
};

export default CodingIntroduction;

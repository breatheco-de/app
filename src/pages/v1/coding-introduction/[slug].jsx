import {
  Avatar, Box, Button, Container, Text, useColorModeValue, useMediaQuery,
} from '@chakra-ui/react';
import Image from 'next/image';
import PropTypes from 'prop-types';
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

  console.log('data:::', data);
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
              <Box as="strong" className="highlighted" margin="0 0 0 10px" display={{ base: 'none', sm: 'initial' }}>
                {data.title}
              </Box>
            </Heading>
            <Box as="strong" className="highlighted" fontSize="35px" display={{ base: 'initial', sm: 'none' }}>
              {data.title}
            </Box>
            <Text fontSize="18px" fontWeight={700} pt="16px">
              {data.description}
            </Text>
            {data?.callToAction?.title && (
              <Button variant="default" fontSiz="13px" m="25px 0" letterSpacing="0.05em" textTransform="uppercase">
                {data.callToAction.title}
              </Button>
            )}
            {data?.bullets && (
              <Box as="ul" display="flex" flexDirection="column" gridGap="4px">
                {data.bullets.map((l) => (
                  <Box as="li" key={l.text} display="flex" fontSize="14px" gridGap="10px" alignItems="center">
                    <Icon icon={l.icon} width="14px" height="14px" />
                    {l.text}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
          <Box position="relative" display={{ base: 'none', md: 'initial' }} flex={0.5}>
            <Avatar
              position="absolute"
              left="85px"
              top="85px"
              width="82px"
              height="82px"
              style={{ userSelect: 'none' }}
              src="https://picsum.photos/400/400"
            />
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
              {data.awards.images.map((img) => (
                <Box width="auto" height="auto">
                  <Image key={img.src} src={img.src} width={img.width} height={img.height} />
                </Box>
              ))}
            </Box>
          )}
        </Box>
        <Box display="flex" py="20px" alignItems="center" justifyContent={{ base: 'center', md: 'start' }}>
          <Box display="flex" flexDirection="column" gridGap="10px" flex={{ base: 0.6, md: 0.52 }} textAlign={{ base: 'center', md: 'left' }}>
            <Heading as="h2" size="14px" letterSpacing="0.05em" color="blue.default">
              Meet students from all over the world
            </Heading>
            <Text fontSize="26px" fontWeight="700" lineHeight="24px">
              120 people took this course and 63 are online right now
            </Text>
            <Text fontSize="14px" fontWeight="400" letterSpacing="0.05em" color={useColorModeValue('gray.700', 'gray.300')}>
              Some of our students are open to speak with others any time, by pressing
              this buttom you will be able to schedule a meeting with one of them
            </Text>
            <Button variant="default" width="fit-content" mt="9px" alignSelf={{ base: 'center', md: 'start' }}>
              Meet developers in the making
            </Button>
          </Box>
          {/* List of images */}
          {!isBelowTablet && (
            // height="442px"
            <Box position="relative" flex={1} height="442px">
              <Box position="absolute" width="92px" height="92px" left="95px" bottom="107px" background="blue.light" borderRadius={50} filter="blur(10px)" />
              <Box position="absolute" width="78px" height="78px" left="195px" bottom="246px" background="blue.default" borderRadius={50} filter="blur(45px)" />
              <Box position="absolute" width="98px" height="98px" left="235px" bottom="266px" background="rgba(255, 183, 24, 0.36)" borderRadius={50} filter="blur(30px)" />
              <Box position="absolute" width="58px" height="58px" left="296px" bottom="138px" background="yellow.light" borderRadius={50} />
              <Box position="absolute" width="24px" height="24px" left="382px" top="200px" background="blue.light" borderRadius={50} />
              <Box position="absolute" width="80px" height="80px" right="180px" bottom="74px" background="blue.default" borderRadius={50} filter="blur(34px)" />

              <Avatar src={avatars[0].picture} width="53px" height="53px" position="absolute" left="85px" bottom="226px" style={{ userSelect: 'none' }} alt={`${avatars[0].firstName}-${avatars[0].lastName}`} bg="transparent" />
              <Avatar src={avatars[1].picture} width="75px" height="75px" position="absolute" left="125px" top="0" style={{ userSelect: 'none' }} alt={`${avatars[1].firstName}-${avatars[1].lastName}`} bg="transparent" />
              <Avatar src={avatars[2].picture} width="104px" height="104px" position="absolute" left="195px" bottom="240px" style={{ userSelect: 'none' }} alt={`${avatars[2].firstName}-${avatars[2].lastName}`} zIndex={2} bg="transparent" />
              <Avatar src={avatars[3].picture} width="65px" height="65px" position="absolute" left="185px" bottom="139px" style={{ userSelect: 'none' }} alt={`${avatars[3].firstName}-${avatars[3].lastName}`} zIndex={2} bg="transparent" />
              <Avatar src={avatars[4].picture} width="107px" height="107px" position="absolute" left="225px" bottom="0" style={{ userSelect: 'none' }} alt={`${avatars[4].firstName}-${avatars[4].lastName}`} zIndex={2} bg="transparent" />
              <Avatar src={avatars[5].picture} width="81px" height="81px" position="absolute" left="336px" bottom="89px" style={{ userSelect: 'none' }} alt={`${avatars[5].firstName}-${avatars[5].lastName}`} zIndex={2} bg="transparent" />
              <Avatar src={avatars[6].picture} width="40px" height="40px" position="absolute" left="400px" top="210px" style={{ userSelect: 'none' }} alt={`${avatars[6].firstName}-${avatars[6].lastName}`} zIndex={2} bg="transparent" />
              <Avatar src={avatars[7].picture} width="44px" height="44px" position="absolute" left="410px" top="78px" style={{ userSelect: 'none' }} alt={`${avatars[7].firstName}-${avatars[7].lastName}`} zIndex={2} bg="transparent" />
              <Avatar src={avatars[8].picture} width="80px" height="80px" position="absolute" right={{ md: '135px', lg: '235px' }} top="170px" style={{ userSelect: 'none' }} alt={`${avatars[8].firstName}-${avatars[8].lastName}`} zIndex={2} bg="transparent" />
              <Avatar src={avatars[9].picture} width="104px" height="104px" position="absolute" right={{ md: '110px', lg: '210px' }} bottom="40px" style={{ userSelect: 'none' }} alt={`${avatars[9].firstName}-${avatars[9].lastName}`} zIndex={2} bg="transparent" />
              <Avatar src={avatars[10].picture} width="45px" height="45px" position="absolute" right={{ md: '18px', lg: '118px' }} bottom="185px" style={{ userSelect: 'none' }} alt={`${avatars[10].firstName}-${avatars[10].lastName}`} zIndex={2} bg="transparent" />
              <Avatar src={avatars[11].picture} width="53px" height="53px" position="absolute" right={{ md: '38px', lg: '138px' }} top="84px" style={{ userSelect: 'none' }} alt={`${avatars[11].firstName}-${avatars[11].lastName}`} zIndex={2} bg="transparent" />
            </Box>
          )}
        </Box>
      </Container>
      <Box display="flex" p="8px 53px 0 53px" gridGap={51} background="linear-gradient(360deg, #EEF9FE 54.09%, rgba(238, 249, 254, 0) 100%)" alignItems="center" justifyContent={{ base: 'center', md: 'start' }}>
        <Box position="relative" flex={0.5} height="562px">
          <Avatar src={avatars[6].picture} width="147px" height="147px" position="absolute" left="0" top="85px" style={{ userSelect: 'none' }} alt={`${avatars[6].firstName}-${avatars[6].lastName}`} bg="transparent" />
          <Avatar src={avatars[3].picture} width="89px" height="89px" position="absolute" left="50px" bottom="136px" style={{ userSelect: 'none' }} alt={`${avatars[3].firstName}-${avatars[3].lastName}`} bg="transparent" />
          <Avatar src={avatars[10].picture} width="158px" height="158px" position="absolute" left="214px" top="142px" style={{ userSelect: 'none' }} alt={`${avatars[10].firstName}-${avatars[10].lastName}`} bg="transparent" />
          <Avatar src={avatars[5].picture} width="129px" height="129px" position="absolute" right="67px" top="59px" style={{ userSelect: 'none' }} alt={`${avatars[5].firstName}-${avatars[5].lastName}`} bg="transparent" />
          <Avatar src={avatars[8].picture} width="137px" height="137px" position="absolute" right="28px" bottom="127px" style={{ userSelect: 'none' }} alt={`${avatars[8].firstName}-${avatars[8].lastName}`} bg="transparent" />
          <Avatar src={avatars[7].picture} width="109px" height="109px" position="absolute" right="0" top="172px" style={{ userSelect: 'none' }} alt={`${avatars[7].firstName}-${avatars[7].lastName}`} bg="transparent" />
        </Box>
        <Box display="flex" flexDirection="column" gridGap="10px" flex={{ base: 0.6, md: 0.32 }} textAlign={{ base: 'center', md: 'left' }}>
          <Heading as="h2" size="14px" letterSpacing="0.05em" color="blue.default">
            We support you in your journey, wherever you are
          </Heading>
          <Text fontSize="26px" fontWeight="700" lineHeight="24px">
            There are +6 mentors online and available right now.
          </Text>
          <Text fontSize="14px" fontWeight="400" letterSpacing="0.05em" color={useColorModeValue('gray.700', 'gray.300')}>
            Some of our students are open to speak with others any time, by pressing
            this buttom you will be able to schedule a meeting with one of them
          </Text>
          <Button variant="default" width="fit-content" mt="9px" alignSelf={{ base: 'center', md: 'start' }}>
            Schedule a mentoring session
          </Button>
        </Box>
      </Box>

      <Box bg="black" width="100%" height="300px">
        rest of content
      </Box>
    </Box>
  );
};

CodingIntroduction.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default CodingIntroduction;

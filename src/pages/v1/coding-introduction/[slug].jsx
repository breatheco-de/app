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
    picture: 'https://picsum.photos/400/400',
  },
  {
    firstName: 'Jhon',
    lastName: 'Module',
    picture: 'https://picsum.photos/401/401',
  },
  {
    firstName: 'Harry',
    lastName: 'Jackson',
    picture: 'https://picsum.photos/402/402',
  },
  {
    firstName: 'Jimmy',
    lastName: 'Tomato',
    picture: 'https://picsum.photos/403/403',
  },
  {
    firstName: 'Jhonny',
    lastName: 'Johnson',
    picture: 'https://picsum.photos/404/404',
  },
  {
    firstName: 'Doe',
    lastName: 'Doe',
    picture: 'https://picsum.photos/405/405',
  },
  {
    firstName: 'Brian',
    lastName: 'Castro',
    picture: 'https://picsum.photos/406/406',
  },
  {
    firstName: 'George',
    lastName: 'Vegas',
    picture: 'https://picsum.photos/407/407',
  },
  {
    firstName: 'Jessie',
    lastName: 'Kamp',
    picture: 'https://picsum.photos/408/408',
  },
  {
    firstName: 'Claudia',
    lastName: 'Casas',
    picture: 'https://picsum.photos/409/409',
  },
  {
    firstName: 'Kevin',
    lastName: 'Read',
    picture: 'https://picsum.photos/410/410',
  },
  {
    firstName: 'Mike',
    lastName: 'Torres',
    picture: 'https://picsum.photos/411/411',
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
            <Button variant="default" fontSiz="13px" m="25px 0" letterSpacing="0.05em" textTransform="uppercase">
              {data.callToAction.title}
            </Button>
            <Box as="ul" display="flex" flexDirection="column" gridGap="4px">
              {data.bullets.map((l) => (
                <Box as="li" key={l.text} display="flex" fontSize="14px" gridGap="10px" alignItems="center">
                  <Icon icon={l.icon} width="14px" height="14px" />
                  {l.text}
                </Box>
              ))}
            </Box>
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
          <Heading as="h2" size="18px" pb="28px">
            {data.awards.title}
          </Heading>
          <Box display="grid" gridRowGap="20px" alignItems="center" justifyItems="center" gridTemplateColumns="repeat(auto-fill, minmax(13rem, 1fr))">
            {data.awards.images.map((img) => (
              <Box width="auto" height="auto">
                <Image key={img.src} src={img.src} width={img.width} height={img.height} />
              </Box>
            ))}
          </Box>
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
            <Box position="relative" flex={1} height="464px">
              <Box position="absolute" width="92px" height="92px" left="95px" top="265px" background="blue.light" borderRadius={50} filter="blur(10px)" />
              <Box position="absolute" width="78px" height="78px" left="195px" top="140px" background="blue.default" borderRadius={50} filter="blur(45px)" />
              <Box position="absolute" width="98px" height="98px" left="235px" top="100px" background="rgba(255, 183, 24, 0.36)" borderRadius={50} filter="blur(30px)" />
              <Box position="absolute" width="58px" height="58px" left="296px" top="268px" background="yellow.light" borderRadius={50} />
              <Box position="absolute" width="24px" height="24px" left="382px" top="200px" background="blue.light" borderRadius={50} />
              <Box position="absolute" width="80px" height="80px" right="180px" top="310px" background="blue.default" borderRadius={50} filter="blur(34px)" />

              <Avatar src={avatars[0].picture} width="53px" height="53px" position="absolute" left="85px" top="185px" style={{ userSelect: 'none' }} alt={`${avatars[0].firstName}-${avatars[0].lastName}`} />
              <Avatar src={avatars[1].picture} width="75px" height="75px" position="absolute" left="125px" top="0" style={{ userSelect: 'none' }} alt={`${avatars[1].firstName}-${avatars[1].lastName}`} />
              <Avatar src={avatars[2].picture} width="104px" height="104px" position="absolute" left="195px" top="120px" style={{ userSelect: 'none' }} alt={`${avatars[2].firstName}-${avatars[2].lastName}`} zIndex={2} />
              <Avatar src={avatars[3].picture} width="65px" height="65px" position="absolute" left="185px" top="260px" style={{ userSelect: 'none' }} alt={`${avatars[3].firstName}-${avatars[3].lastName}`} zIndex={2} />
              <Avatar src={avatars[4].picture} width="107px" height="107px" position="absolute" left="225px" bottom="0" style={{ userSelect: 'none' }} alt={`${avatars[4].firstName}-${avatars[4].lastName}`} zIndex={2} />
              <Avatar src={avatars[5].picture} width="81px" height="81px" position="absolute" left="336px" bottom="89px" style={{ userSelect: 'none' }} alt={`${avatars[5].firstName}-${avatars[5].lastName}`} zIndex={2} />
              <Avatar src={avatars[6].picture} width="40px" height="40px" position="absolute" left="400px" top="210px" style={{ userSelect: 'none' }} alt={`${avatars[6].firstName}-${avatars[6].lastName}`} zIndex={2} />
              <Avatar src={avatars[7].picture} width="44px" height="44px" position="absolute" left="410px" top="78px" style={{ userSelect: 'none' }} alt={`${avatars[7].firstName}-${avatars[7].lastName}`} zIndex={2} />
              <Avatar src={avatars[8].picture} width="80px" height="80px" position="absolute" right={{ md: '135px', lg: '235px' }} top="170px" style={{ userSelect: 'none' }} alt={`${avatars[8].firstName}-${avatars[8].lastName}`} zIndex={2} />
              <Avatar src={avatars[9].picture} width="104px" height="104px" position="absolute" right={{ md: '110px', lg: '210px' }} bottom="40px" style={{ userSelect: 'none' }} alt={`${avatars[9].firstName}-${avatars[9].lastName}`} zIndex={2} />
              <Avatar src={avatars[10].picture} width="45px" height="45px" position="absolute" right={{ md: '18px', lg: '118px' }} top="234px" style={{ userSelect: 'none' }} alt={`${avatars[10].firstName}-${avatars[10].lastName}`} zIndex={2} />
              <Avatar src={avatars[11].picture} width="53px" height="53px" position="absolute" right={{ md: '38px', lg: '138px' }} top="84px" style={{ userSelect: 'none' }} alt={`${avatars[11].firstName}-${avatars[11].lastName}`} zIndex={2} />
            </Box>
          )}
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

export default CodingIntroduction;

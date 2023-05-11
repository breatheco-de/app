import PropTypes from 'prop-types';
import {
  Box, Container, Text, useColorModeValue, useMediaQuery,
} from '@chakra-ui/react';
import Plx from 'react-plx';
import { useRouter } from 'next/router';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { AnimatedAvatar, AnimatedButton, ShadowCard } from '../../common/components/Animated';
import { parallaxAvatars2 } from '../../lib/landing-props';
import Heading from '../../common/components/Heading';
import Icon from '../../common/components/Icon';

function Mentors({ data, users }) {
  const [avatarIndex, setAvatarIndex] = useState(1);
  const [isBelowTablet] = useMediaQuery('(max-width: 768px)');
  const fadeOutBackground = useColorModeValue('#EEF9FE', '#2D3748');

  const router = useRouter();

  const getUser = (user) => {
    const fullName = `${user?.first_name} ${user?.last_name}`;
    const fullNameSlug = `${user?.first_name}-${user?.last_name}`;
    const avatarUrl = user?.profile?.avatar_url;

    return { fullName, fullNameSlug, avatarUrl };
  };

  const handleMouseLeave = () => {
    const timer = setTimeout(() => {
      setAvatarIndex(1);
    }, 400);

    return () => clearTimeout(timer);
  };

  return (
    <Box height="100%" background={`linear-gradient(360deg, ${fadeOutBackground} 54.09%, rgba(238, 249, 254, 0) 100%)`}>
      <Container display="flex" maxW="container.xl" justifyContent="center" gridGap="5rem" p="0" alignItems="center">
        {!isBelowTablet && users && (
          <Box position="relative" flex={{ base: 1, md: 0.6 }} height={{ base: '350px', md: '562px' }}>
            <Plx
              style={{
                position: 'absolute', left: '0px', top: 0, zIndex: 1,
              }}
              parallaxData={parallaxAvatars2}
            >
              <AnimatedAvatar src={getUser(users[9]?.user).avatarUrl} onClick={() => setAvatarIndex(0)} style={{ border: avatarIndex === 0 && '4px solid #0097CF', zIndex: avatarIndex === 3 ? 0 : 2 }} width="147px" height="147px" position="absolute" left="0" top="85px" alt={getUser(users[9]?.user).fullNameSlug} />
              <AnimatedAvatar src={getUser(users[10]?.user).avatarUrl} onClick={() => setAvatarIndex(1)} style={{ border: avatarIndex === 1 && '4px solid #0097CF', zIndex: avatarIndex === 3 ? 0 : 2 }} width="158px" height="158px" position="absolute" left="245px" top="142px" alt={getUser(users[10]?.user).fullNameSlug} zIndex={2} />
            </Plx>
            <AnimatedAvatar src={getUser(users[3]?.user).avatarUrl} onClick={() => setAvatarIndex(2)} style={{ border: avatarIndex === 2 && '4px solid #0097CF', zIndex: avatarIndex === 3 ? 0 : 2 }} width="89px" height="89px" position="absolute" left="50px" bottom="136px" alt={getUser(users[3]?.user).fullNameSlug} />
            <Plx
              style={{
                position: 'absolute', right: 0, top: 0, zIndex: 5,
              }}
              parallaxData={parallaxAvatars2}
            >
              <AnimatedAvatar src={getUser(users[5]?.user).avatarUrl} onClick={() => setAvatarIndex(3)} style={{ border: avatarIndex === 3 && '4px solid #0097CF' }} width="129px" height="129px" position="absolute" right="90px" top="59px" alt={getUser(users[5]?.user).fullNameSlug} />
            </Plx>
            <AnimatedAvatar src={getUser(users[7]?.user).avatarUrl} onClick={() => setAvatarIndex(4)} style={{ border: avatarIndex === 4 && '4px solid #0097CF', zIndex: avatarIndex === 3 ? 0 : 2 }} width="109px" height="109px" position="absolute" right="0" top="172px" alt={getUser(users[7]?.user).fullNameSlug} />
            <AnimatedAvatar src={getUser(users[8]?.user).avatarUrl} onClick={() => setAvatarIndex(5)} style={{ border: avatarIndex === 5 && '4px solid #0097CF', zIndex: avatarIndex === 4 ? 0 : 1 }} width="137px" height="137px" position="absolute" right="51px" bottom="127px" alt={getUser(users[8]?.user).fullNameSlug} />

            <AnimatePresence>
              {avatarIndex === 0 && (<ShadowCard index={1} data={getUser(users[9]?.user)} onMouseLeave={() => handleMouseLeave()} left="-40px" top="205px" width="228px" p="30px 10px 2px 10px" gridGap="2px" height="138px" />)}
              {avatarIndex === 1 && (<ShadowCard index={2} data={getUser(users[10]?.user)} left="195px" top="252px" width="258px" pt="60px" gridGap="10px" height="168px" />)}
              {avatarIndex === 2 && (<ShadowCard index={3} data={getUser(users[3]?.user)} onMouseLeave={() => handleMouseLeave()} left="-12px" bottom="15px" width="218px" p="35px 10px 10px 10px" gridGap="2px" height="142px" />)}
              {avatarIndex === 3 && (<ShadowCard index={4} data={getUser(users[5]?.user)} onMouseLeave={() => handleMouseLeave()} right="48px" top="158px" width="218px" p="38px 10px 10px 10px" gridGap="2px" height="142px" style={{ zIndex: 2 }} />)}
              {avatarIndex === 4 && (<ShadowCard index={5} data={getUser(users[7]?.user)} onMouseLeave={() => handleMouseLeave()} right="-50px" top="252px" width="218px" p="38px 10px 10px 10px" gridGap="2px" height="142px" style={{ zIndex: 1 }} />)}
              {avatarIndex === 5 && (<ShadowCard index={6} data={getUser(users[8]?.user)} onMouseLeave={() => handleMouseLeave()} right="10px" bottom="15px" width="218px" p="38px 10px 10px 10px" gridGap="2px" height="142px" style={{ zIndex: 0 }} />)}
            </AnimatePresence>
          </Box>
        )}

        <Box display="flex" flexDirection="column" alignItems={{ base: 'center', md: 'start' }} flex={{ base: 1, md: 0.4 }} textAlign={{ base: 'center', md: 'left' }}>
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
            <Box display={{ base: 'none', sm: 'flex' }} position="relative" bottom="-6px" left="-100px">
              <Icon icon="leftArrow" width="200px" height="39px" />
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}

Mentors.propTypes = {
  data: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  users: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))),
};

Mentors.defaultProps = {
  users: null,
};

export default Mentors;

/* eslint-disable react/self-closing-comp */
import useTranslation from 'next-translate/useTranslation';
import {
  Box, Container, Image, Avatar,
} from '@chakra-ui/react';
import Script from 'next/script';
import Link from '../common/components/NextChakraLink';
import Heading from '../common/components/Heading';
import Text from '../common/components/Text';
import Icon from '../common/components/Icon';
import useStyle from '../common/hooks/useStyle';

export const getStaticProps = () => ({
  props: {
    seo: {
      title: 'Podcast',
      description: 'A tech-culture podcast where you learn to fight the enemies to become a successful professional in tech.',
    },
  },
});

const podcastPage = () => {
  const { featuredLight, hexColor } = useStyle();
  const { t } = useTranslation('podcast');

  const links = t('header.links', {}, { returnObjects: true });
  const hosts = t('hosts', {}, { returnObjects: true });

  return (
    <Container maxWidth="1280px" marginTop="20px">
      <Box marginBottom="20px" display="flex" alignItems="center" flexWrap={{ base: 'wrap', md: 'nowrap' }} gap="20px">
        <Box>
          <Heading marginBottom="24px" fontFamily="Space Grotesk Variable">{t('header.title')}</Heading>
          <Text fontSize="18px">{t('header.description')}</Text>
          <Box marginTop="20px">
            <Text>{t('header.listen-on')}</Text>
            <Box marginTop="10px" display="flex" gap="16px" flexWrap="wrap">
              {links.map((elem) => (
                <Link href={elem.href} key={elem.href} target="_blank">
                  <Box
                    width="25px"
                    height="30px"
                    backgroundImage="url(/static/images/podcast-logos.svg)"
                    backgroundPosition={`0px ${elem.position}`}
                  />
                </Link>
              ))}
            </Box>
          </Box>
        </Box>
        <Box flexShrink="0" width={{ base: '100%', md: 'auto' }}>
          <Image src={t('header.image')} alt="Podcast" width={{ base: '100%', md: '400px', lg: '548px' }} height="328px" />
        </Box>
      </Box>
      <div id="buzzsprout-large-player"></div>
      <Script
        async
        type="text/javascript"
        charSet="utf-8"
        src="https://www.buzzsprout.com/2309390.js?container_id=buzzsprout-large-player&player=large"
      />
      <Box marginTop="20px">
        <Heading textAlign="center" marginBottom="32px">
          {t('meet-the-hosts')}
        </Heading>
        <Box display="flex" gap="24px" flexWrap={{ base: 'wrap', md: 'nowrap' }} justifyContent="space-between">
          {hosts.map((host) => (
            <Box key={host.name} background={featuredLight} borderRadius="13px" padding="16px" width="100%" maxWidth={{ base: 'none', md: '547px' }}>
              <Box display="flex" gap="16px" alignItems="center" marginBottom="24px">
                <Avatar src={host['profile-picture']} width="127px" height="127px" />
                <Box>
                  <Heading marginBottom="8px" size="sm" color={hexColor.blueDefault}>
                    {host.name}
                  </Heading>
                  <Text fontSize="18px">
                    {host.description}
                  </Text>
                  <Box marginTop="16px" display="flex" gap="20px">
                    {host.media.map((elem) => (
                      <Link key={elem.href} href={elem.href} target="_blank">
                        <Icon icon={elem.logo} color={hexColor.blueDefault} width="20px" height="20px" />
                      </Link>
                    ))}
                  </Box>
                </Box>
              </Box>
              <Text fontSize="18px" lineHeight="21px">
                {host.bio}
              </Text>
            </Box>
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default podcastPage;

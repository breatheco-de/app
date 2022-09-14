/* eslint-disable object-curly-newline */
import {
  Box, Button, Container, Image, useColorModeValue,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import bc from '../../common/services/breathecode';
import Heading from '../../common/components/Heading';
import Icon from '../../common/components/Icon';
import { getDataContentProps } from '../../utils/file';
import IntroductionSection from '../../js_modules/landing/introductionSection';
import Students from '../../js_modules/landing/students';
import Mentors from '../../js_modules/landing/mentors';
import Events from '../../js_modules/landing/events';
import PreviewModules from '../../js_modules/landing/previewModules';
import Pricing from '../../js_modules/landing/pricing';

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

const CodingIntroduction = ({ data }) => {
  const [users, setUsers] = useState(null);
  const [events, setEvents] = useState(null);
  const router = useRouter();
  const featuredBg = useColorModeValue('featuredLight', 'featuredDark');

  useEffect(() => {
    bc.public({
      syllabus: 'coding-introduction',
      roles: 'TEACHER,ASSISTANT',
    }).mentors()
      .then((res) => {
        const filterWithImages = res.data.filter(
          (l) => l.user.profile && l.user.profile?.avatar_url,
        );
        return setUsers(filterWithImages);
      })
      .catch(() => {});

    bc.public().events()
      .then((res) => setEvents(res.data))
      .catch(() => {});
  }, []);

  return (
    <Box pt="3rem">
      <Container maxW="container.xl">
        <IntroductionSection data={data} />

        <Box p="30px 0">
          {data?.awards?.title && (
            <Heading as="h2" size="18px" mb="28px">
              {data.awards.title}
            </Heading>
          )}
          {data?.awards?.images && (
            <Box display="grid" gridRowGap="20px" alignItems="center" justifyItems="center" gridTemplateColumns="repeat(auto-fill, minmax(13rem, 1fr))">
              {data.awards.images.map((img, i) => (
                <Box display="flex" key={img.src} width="auto" height="auto" background="white" borderRadius="4px" p="2px">
                  <Image key={img.src} src={img.src} width={img.width} height={img.height} alt={`image ${i}`} />
                </Box>
              ))}
            </Box>
          )}
        </Box>

        <Students data={data} />

      </Container>
      <Mentors data={data} users={users} />
      <Events data={data} events={events} />
      <PreviewModules data={data} />

      <Box background={featuredBg} p="4rem 0 2.2rem">
        <Container maxW="1100px" margin="0 auto" display="flex" gridGap="3.5rem" flexDirection={{ base: 'column', md: 'row' }}>
          <Box flex={1} position="relative" width={{ base: '100%', md: '100%' }} height="100%">
            <Image src={data?.certificate?.image} layout="fill" objectFit="contain" style={{ aspectRatio: '12/8' }} alt="certificate preview" />
          </Box>
          <Box display="flex" flexDirection="column" flex={0.7} gridGap="10px">
            <Heading as="span" size="14px" color="blue.default">
              {data?.certificate?.label}
            </Heading>
            <Heading as="h2" fontWeight="700" size="sm">
              {data?.certificate?.title}
            </Heading>
            <Box as="ul" style={{ listStyle: 'none' }} display="flex" flexDirection="column" gridGap="6px">
              {data?.certificate?.bullet.list.map((l) => (
                <Box as="li" key={l?.title} display="flex" flexDirection="row" lineHeight="24px" gridGap="6px">
                  <Icon icon="checked2" color="#38A56A" width="12px" height="9px" style={{ margin: '8px 0 0 0' }} />
                  <Box
                    fontSize="14px"
                    fontWeight="600"
                    letterSpacing="0.05em"
                    dangerouslySetInnerHTML={{ __html: l?.title }}
                  />
                </Box>
              ))}
            </Box>
            <Button variant="default" onClick={() => router.push(data?.certificate?.button.link)} width="fit-content" mt="16px">
              {data?.certificate?.button.title}
            </Button>
          </Box>
        </Container>
      </Box>
      <Pricing data={data} />
    </Box>
  );
};

CodingIntroduction.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default CodingIntroduction;

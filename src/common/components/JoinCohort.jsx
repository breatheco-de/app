import PropTypes from 'prop-types';
import {
  Box, Flex, Button, Img,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import Image from 'next/image';
import Heading from './Heading';
import Text from './Text';
import Icon from './Icon';
import ReactPlayerV2 from './ReactPlayerV2';
import useAuth from '../hooks/useAuth';
import useStyle from '../hooks/useStyle';
import { isAbsoluteUrl } from '../../utils/url';

function JoinCohort({ margin, logo, joinFunction, isFetching, alreadyHaveCohort, cohort, syllabus, href, existsRelatedSubscription }) {
  const { t, lang } = useTranslation('dashboard');
  const { hexColor } = useStyle();
  const { isAuthenticated } = useAuth();

  const introVideo = syllabus?.json?.intro_video?.[lang] || null;

  return (
    <Flex gap="30px" margin={margin} mt={{ base: '4rem', md: '5rem', lg: '50px' }} alignItems="center" justifyContent="space-between" position="relative">
      <Box position="relative" flex={{ base: 1, lg: 0.5 }} background={hexColor.featuredColor} padding="47px 16px" borderRadius="10px">
        {logo && isAbsoluteUrl(logo) ? (
          <Box position="absolute" top="-30px">
            <Image src={logo} width={70} height={70} alt="Course logo" style={{ minWidth: '33px', minHeight: '33px' }} />
          </Box>
        ) : (
          <Box position="absolute" borderRadius="full" top="-30px" background={hexColor.green} padding="16px">
            <Icon
              width="38px"
              height="38px"
              icon="coding"
            />
          </Box>
        )}
        <Heading margin="20px 0" size="38px">
          {t('join-cohort-page.join-more')}
        </Heading>
        <Text fontWeight="400" size="18px" color={hexColor.fontColor2} marginBottom="20px">
          {existsRelatedSubscription ? t('join-cohort-page.preview-description') : t('join-cohort-page.cta-description')}
        </Text>
        {!existsRelatedSubscription ? (
          <Button as="a" href={href} textTransform="uppercase" variant="default">
            {t('join-cohort-page.cta-button')}
          </Button>
        ) : (
          <Button
            variant="default"
            isLoading={isFetching || alreadyHaveCohort}
            isDisabled={!isAuthenticated}
            onClick={joinFunction}
            textTransform="uppercase"
            fontSize="13px"
            mt="1rem"
          >
            {cohort?.never_ends ? t('join-cohort-page.start-course') : t('join-cohort-page.join-next-cohort')}
          </Button>
        )}
      </Box>
      {introVideo ? (
        <Box flex={{ base: 1, lg: 0.5 }} maxWidth="550px" display={{ base: 'none', lg: 'block' }}>
          <ReactPlayerV2
            withModal
            url={introVideo}
            withThumbnail
            thumbnailStyle={{
              borderRadius: '11px',
              minHeight: '100%',
              height: '382px',
            }}
          />
        </Box>
      ) : (
        <Img maxWidth="420px" flex={{ base: 1, lg: 0.5 }} flexShrink={0} zIndex={10} margin="0 auto" display={{ base: 'none', lg: 'block' }} src="/static/images/women-laptop-people.png" />
      )}
    </Flex>
  );
}

JoinCohort.propTypes = {
  margin: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string]),
  logo: PropTypes.string,
  joinFunction: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
  alreadyHaveCohort: PropTypes.bool.isRequired,
  cohort: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  syllabus: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  existsRelatedSubscription: PropTypes.bool.isRequired,
  href: PropTypes.string,
};
JoinCohort.defaultProps = {
  margin: null,
  logo: null,
  syllabus: null,
  href: '',
};

export default JoinCohort;

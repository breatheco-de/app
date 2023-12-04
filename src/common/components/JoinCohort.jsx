import PropTypes from 'prop-types';
import {
  Box, Flex, Button, Img,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import Image from 'next/image';
import Heading from './Heading';
import Text from './Text';
import Icon from './Icon';
import useAuth from '../hooks/useAuth';
import useStyle from '../hooks/useStyle';
import { isAbsoluteUrl } from '../../utils/url';

function JoinCohort({ margin, logo, joinFunction, isFetching, alreadyHaveCohort }) {
  const { t } = useTranslation('dashboard');
  const { hexColor } = useStyle();
  const { isAuthenticated } = useAuth();
  return (
    <Flex gap="30px" margin={margin} mt={{ base: '4rem', md: '5rem', lg: '50px' }} alignItems="center" justifyContent="space-between" position="relative">
      <Box position="relative" flex={0.5} background={hexColor.featuredColor} padding="47px 16px" borderRadius="10px">
        {logo && isAbsoluteUrl(logo) ? (
          <Box position="relative" top="-30px">
            <Image src={logo} width="44px" height="44px" alt="Course logo" style={{ minWidth: '33px', minHeight: '33px' }} />
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
          {t('join-cohort-page.preview-description')}
        </Text>
        <Button
          variant="default"
          isLoading={isFetching || alreadyHaveCohort}
          isDisabled={!isAuthenticated}
          onClick={joinFunction}
          textTransform="uppercase"
          fontSize="13px"
          mt="1rem"
        >
          {t('join-cohort-page.join-next-cohort')}
        </Button>
      </Box>
      <Img maxWidth="420px" flex={0.5} flexShrink={0} zIndex={10} margin="0 auto" display={{ base: 'none', lg: 'block' }} src="/static/images/women-laptop-people.png" />
    </Flex>
  );
}

JoinCohort.propTypes = {
  margin: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string]),
  logo: PropTypes.string,
  joinFunction: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
  alreadyHaveCohort: PropTypes.bool.isRequired,
};
JoinCohort.defaultProps = {
  margin: null,
  logo: null,
};

export default JoinCohort;

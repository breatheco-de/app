/* eslint-disable no-unused-vars */
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

function JoinCohort({ margin, logo, joinFunction, isFetching, alreadyHaveCohort, cohort }) {
  const { t } = useTranslation('dashboard');
  const { hexColor } = useStyle();
  const { isAuthenticated } = useAuth();
  return (
    <Flex gap="30px" margin={margin}>
      <Box position="relative" maxWidth="420px" background={hexColor.featuredColor} padding="15px" borderRadius="10px">
        {logo && isAbsoluteUrl(logo) ? (
          <Box position="relative" top="-30px">
            <Image src={logo} width={33} height={33} alt="Course logo" style={{ minWidth: '33px', minHeight: '33px' }} />
          </Box>
        ) : (
          <Box position="absolute" borderRadius="full" top="-30px" background={hexColor.green} padding="10px">
            <Icon
              width="32px"
              height="32px"
              icon="coding"
            />
          </Box>
        )}
        <Heading margin="20px 0" size="sm">
          {t('join-cohort-page.join-more')}
        </Heading>
        <Text fontWeight="400" size="md" color={hexColor.fontColor2} marginBottom="20px">
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
          {cohort?.never_ends ? t('join-cohort-page.start-course') : t('join-cohort-page.join-next-cohort')}
        </Button>
      </Box>
      <Img maxWidth="420px" display={{ base: 'none', lg: 'block' }} src="/static/images/women-laptop-people.png" />
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
};
JoinCohort.defaultProps = {
  margin: null,
  logo: null,
};

export default JoinCohort;

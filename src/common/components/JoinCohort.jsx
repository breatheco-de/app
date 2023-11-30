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

function Bubbles() {
  return (
    <>
      <Box position="absolute" top={0} right={20} opacity={0.4}>
        {/* "w874 h415" */}
        <svg width="100%" height="415" viewBox="0 0 874 415" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="44.2684" cy="391.417" r="43.5833" fill="#0097CD" />
          <circle cx="736.759" cy="169.349" r="19.3704" fill="#FFB718" />
          <circle cx="834.303" cy="48.2843" r="39.4325" fill="#C7F3FD" />
        </svg>

      </Box>
      <Box position="absolute" top={0} left={0}>
        <svg width="100%" height="415" viewBox="0 0 874 415" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="256.651" cy="188.72" r="164.648" fill="#FFB718" fillOpacity="0.2" />
          <circle cx="4.15079" cy="4.15079" r="4.15079" transform="matrix(-1 0 0 1 490.479 0.550293)" fill="#FFB718" />
          <circle cx="256.987" cy="202.987" r="17.9868" fill="#CD0000" />
          <circle cx="452.43" cy="114.697" r="7.60979" fill="#0097CD" />
        </svg>
      </Box>
    </>
  );
}
function JoinCohort({ margin, logo, joinFunction, isFetching, alreadyHaveCohort }) {
  const { t } = useTranslation('dashboard');
  const { hexColor } = useStyle();
  const { isAuthenticated } = useAuth();
  return (
    <Flex gap="30px" margin={margin} mt={{ base: '4rem', md: '5rem', lg: '50px' }} alignItems="center" justifyContent="center" position="relative">
      <Bubbles />
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
          {t('join-cohort-page.join-next-cohort')}
        </Button>
      </Box>
      <Img maxWidth="420px" zIndex={10} display={{ base: 'none', lg: 'block' }} src="/static/images/women-laptop-people.png" />
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

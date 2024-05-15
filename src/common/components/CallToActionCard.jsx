/* eslint-disable no-unused-vars */
import PropTypes from 'prop-types';
import {
  Box,
  Button,
} from '@chakra-ui/react';
import Image from 'next/image';
import Text from './Text';
import Heading from './Heading';
import NextChakraLink from './NextChakraLink';
import useStyle from '../hooks/useStyle';
import { reportDatalayer } from '../../utils/requests';

function CallToActionCard({ title, description, buttonLabel, forwardUrl, iconUrl, pillLabel, iconStyles, buttonStyles, descriptionStyles, adType, ...rest }) {
  const { hexColor } = useStyle();
  return (
    <Box
      border="1px solid"
      borderColor={hexColor.borderColor}
      padding="8px"
      position="relative"
      borderRadius="8px"
      maxWidth="350px"
      {...rest}
    >
      <Box minHeight="17px" display="flex" flexDirection="row-reverse">
        {pillLabel && (
          <Box padding="3px 10px 3px 10px" borderRadius="15px" fontSize="9px" background="green.light" color="blue.900">
            {pillLabel}
          </Box>
        )}
      </Box>
      <Box position="absolute" borderRadius="full" top="-30px" width="44px" height="44px" {...iconStyles}>
        <Image src={iconUrl} width={44} height={44} />
      </Box>
      <Heading as="span" size="xsm" marginBottom="8px">
        {title}
      </Heading>
      <Text size="md" lineHeight="16px" wwight="400" marginBottom="16px" {...descriptionStyles}>
        {description}
      </Text>
      <NextChakraLink
        href={forwardUrl}
        fontWeight="700"
        color={hexColor.blueDefault}
        display="block"
        textAlign="center"
        onClick={() => {
          reportDatalayer({
            dataLayer: {
              event: 'ad_interaction',
              ad_type: adType,
              ad_position: 'side',
            },
          });
        }}
        {...buttonStyles}
      >
        {buttonLabel}
      </NextChakraLink>
    </Box>
  );
}

CallToActionCard.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  buttonLabel: PropTypes.string,
  forwardUrl: PropTypes.string,
  adType: PropTypes.string,
  iconUrl: PropTypes.string,
  pillLabel: PropTypes.string,
  iconStyles: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  buttonStyles: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  descriptionStyles: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};

CallToActionCard.defaultProps = {
  title: '',
  description: '',
  buttonLabel: '',
  forwardUrl: '',
  iconUrl: '',
  pillLabel: null,
  iconStyles: {},
  buttonStyles: {},
  descriptionStyles: {},
  adType: '',
};

export default CallToActionCard;

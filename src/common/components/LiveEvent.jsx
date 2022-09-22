/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-vars */
import { useState } from 'react';
import {
  Box, Stack, useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import Link from './NextChakraLink';
import Heading from './Heading';
import Text from './Text';
import Icon from './Icon';

const LiveEvent = () => {
  const { t } = useTranslation('live-event');
  const bgColor = useColorModeValue('white', 'featuredDark');
  const textColor = useColorModeValue('black', 'white');

  return (
    <Box
      padding="16px 10px"
      background={bgColor}
      border="1px solid"
      borderColor="#DADADA"
      borderRadius="11px"
      maxWidth="345px"
    >
      <Text
        fontSize="md"
        lineHeight="19px"
        fontWeight="700"
        color={textColor}
        textAlign="center"
      >
        {t('title')}
        <Link
          // target="_blank"
          rel="noopener noreferrer"
          href="#"
          color={useColorModeValue('blue.default', 'blue.300')}
          display="inline-block"
          letterSpacing="0.05em"
          fontFamily="Lato, Sans-serif"
        >
          {t('learn-more')}
        </Link>
      </Text>
      <Icon style={{ marginRight: '15px' }} icon="live-event" width="25px" height="25px" />
    </Box>
  );
};

export default LiveEvent;

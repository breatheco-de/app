import React from 'react';
import PropTypes from 'prop-types';
import { Box, Text, Center, useColorModeValue, Tooltip } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import useCanAccess from '../../hooks/useCanAccess';

/**
 * CanAccess component that checks if a user has access to a specific service
 * @param {string} fromAcademy - The academy slug to check access for
 * @param {string} fromCohort - The cohort slug to check access for
 * @param {string} fromMentorshipService - The mentorship service slug to check access for
 * @param {React.ReactNode} children - The content to render if the user has access
 */
function CanAccess({ fromAcademy, fromCohort, fromMentorshipService, children }) {
  const { t } = useTranslation('common');
  const overlayBg = useColorModeValue('rgba(218, 216, 216, 0.8)', 'rgba(50, 50, 50, 0.8)');
  const checkAccess = useCanAccess();

  const { hasAccess } = checkAccess({ fromAcademy, fromCohort, fromMentorshipService });

  // If user has access, render children
  if (hasAccess) {
    return children;
  }

  // If service is blocked, render overlay with message
  return (
    <Box position="relative">
      {children}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg={overlayBg}
        zIndex="10"
        borderRadius="md"
      >
        <Center height="100%" flexDirection="column" p={4}>
          <Text cursor="pointer" fontSize="xl" fontWeight="bold" textAlign="center">
            <Tooltip label={t('service-blocked')}>
              🔒
            </Tooltip>
          </Text>
        </Center>
      </Box>
    </Box>
  );
}

CanAccess.propTypes = {
  fromAcademy: PropTypes.string,
  fromCohort: PropTypes.string,
  fromMentorshipService: PropTypes.string,
  children: PropTypes.node.isRequired,
};

CanAccess.defaultProps = {
  fromAcademy: null,
  fromCohort: null,
  fromMentorshipService: null,
};

export default CanAccess;

/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Flex,
  Box,
  Container,
  Button,
  useToast,
  Skeleton,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import bc from '../../common/services/breathecode';
import useAuth from '../../common/hooks/useAuth';
import useCohortHandler from '../../common/hooks/useCohortHandler';
import useStyle from '../../common/hooks/useStyle';
import Heading from '../../common/components/Heading';
import Text from '../../common/components/Text';
import Icon from '../../common/components/Icon';
import { ProfilesSection } from '../../common/components/SupportSidebar/MentoringConsumables';

function CohortModules({ cohort }) {
  const { t } = useTranslation('dashboard');
  const router = useRouter();
  const { user } = useAuth();
  const { featuredLight, backgroundColor, hexColor } = useStyle();
  const { cohortSession } = useCohortHandler();

  const cohortColor = hexColor.blueDefault;

  return (
    <Accordion allowToggle>
      <AccordionItem borderRadius="8px" padding="16px" border={`1px solid ${cohortColor}`}>
        {({ isExpanded }) => (
          <>
            <AccordionButton padding="0">
              <Box display="flex" justifyContent="space-between" width="100%">
                <Box display="flex" textAlign="left" gap="10px" alignItems="center">
                  <Icon icon="badge" />
                  <Heading size="18px" fontWeight="400">
                    {cohort.name}
                  </Heading>
                  <Box padding="5px 7px" borderRadius="27px" background={cohortColor}>
                    <Text color="white">
                      10 Modules
                    </Text>
                  </Box>
                </Box>
                <Box display="flex" gap="5px" alignItems="center">
                  <Text>
                    {t(isExpanded ? 'hide-content' : 'show-content')}
                  </Text>
                  <AccordionIcon />
                </Box>
              </Box>
            </AccordionButton>
            <AccordionPanel>
              aaaa
            </AccordionPanel>
          </>
        )}
      </AccordionItem>
    </Accordion>
  );
}

export default CohortModules;

CohortModules.propTypes = {
  cohort: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
};

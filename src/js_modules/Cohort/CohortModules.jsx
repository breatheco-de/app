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
  CircularProgress,
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
import Progress from '../../common/components/ProgressBar/Progress';
import { ProfilesSection } from '../../common/components/SupportSidebar/MentoringConsumables';

function CohortModules({ cohort }) {
  const { t, lang } = useTranslation('dashboard');
  const langDict = {
    en: 'us',
    us: 'us',
  };
  const router = useRouter();
  const { user } = useAuth();
  const { featuredLight, backgroundColor, hexColor } = useStyle();
  const { cohortSession, sortedAssignments } = useCohortHandler();
  console.log('sortedAssignments');
  console.log(sortedAssignments);

  const cohortColor = hexColor.blueDefault;

  const getModuleLabel = (module) => {
    if (typeof module.label === 'string') return module.label;
    if (lang in module.label) return module.label[lang];
    return module.label[langDict[lang]];
  };

  const getModulesProgress = (acc, curr) => {
    if (!(curr.task_type in acc)) {
      acc[curr.task_type] = {
        total: 1,
        icon: curr.icon,
        done: curr.task_status === 'DONE' ? 1 : 0,
      };
    } else {
      acc[curr.task_type].total += 1;
      if (curr.task_status === 'DONE') acc[curr.task_type].done += 1;
    }
    return acc;
  };

  return (
    <Accordion allowToggle>
      <AccordionItem borderRadius="8px" padding="16px" border={`1px solid ${cohortColor}`}>
        {({ isExpanded }) => (
          <>
            <AccordionButton _hover={{ background: 'none' }} padding="0" flexDirection="column" alignItems="flex-start" gap="9px">
              <Box display="flex" justifyContent="space-between" width="100%">
                <Box display="flex" textAlign="left" gap="10px" alignItems="center">
                  <Icon icon="badge" />
                  <Heading size="18px" fontWeight="400">
                    {cohort.name}
                  </Heading>
                  <Box padding="5px 7px" borderRadius="27px" background={cohortColor}>
                    <Text color="white">
                      {t('modules-count', { count: 10 })}
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
              <Box borderRadius="4px" padding="8px" background="#E1F5FF" width="100%">
                <Text textAlign="left" size="md" mb="5px">
                  {t('path-to-claim')}
                </Text>
                <Progress progressColor="black" percents={50} barHeight="8px" borderRadius="4px" />
                <Text textAlign="left" mt="5px" size="md">
                  50%
                </Text>
              </Box>
            </AccordionButton>
            <AccordionPanel paddingX="0" display="flex" flexDirection="column" gap="16px">
              {sortedAssignments.map((module) => {
                const assignmentsCount = module.modules.reduce(getModulesProgress, {});
                console.log('assignmentsCount');
                console.log(assignmentsCount);

                const allAssignmenTypes = Object.keys(assignmentsCount);
                const moduleTotalAssignments = allAssignmenTypes.reduce((acc, curr) => assignmentsCount[curr].total + acc, 0);
                const moduleDoneAssignments = allAssignmenTypes.reduce((acc, curr) => assignmentsCount[curr].done + acc, 0);

                return (
                  <Box background={backgroundColor} display="flex" alignItems="center" justifyContent="space-between" padding="8px" borderRadius="8px">
                    <Box display="flex" alignItems="center" gap="16px">
                      {moduleTotalAssignments === moduleDoneAssignments ? (
                        <Icon icon="verified" width="26px" height="26px" color={hexColor.green} />
                      ) : (
                        <CircularProgress color={hexColor.green} size="26px" value={(moduleDoneAssignments * 100) / moduleTotalAssignments} />
                      )}
                      <Text size="md">
                        {getModuleLabel(module)}
                      </Text>
                    </Box>
                    <Box display="flex" alignItems="center" gap="16px">
                      {allAssignmenTypes.map((taskType) => {
                        const { icon, total, done } = assignmentsCount[taskType];
                        return (
                          <Box background="#D6F3FF" padding="4px 8px" borderRadius="18px" display="flex" gap="5px" alignItems="center">
                            <Icon icon={icon} color={cohortColor} width="13px" height="13px" />
                            <Text>
                              {`${done}/`}
                              {total}
                            </Text>
                            {done === total && <Icon icon="checked2" color={hexColor.green} />}
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                );
              })}
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

/* eslint-disable no-unused-vars */
import React, { useMemo, useState, useEffect } from 'react';
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

function CohortModules({ cohort, modules }) {
  console.log('modules');
  console.log(modules);
  const { t, lang } = useTranslation('dashboard');
  const langDict = {
    en: 'us',
    us: 'us',
  };
  const router = useRouter();
  const { user } = useAuth();
  const { featuredLight, backgroundColor, hexColor } = useStyle();
  const { cohortSession, sortedAssignments } = useCohortHandler();

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

  const modulesProgress = useMemo(() => {
    if (!modules || !Array.isArray(modules)) return null;
    const modulesDict = {};
    modules.forEach((module) => {
      const assignmentsCount = module.modules.reduce(getModulesProgress, {});

      const typesPerModule = Object.keys(assignmentsCount);
      const moduleTotalAssignments = typesPerModule.reduce((acc, curr) => assignmentsCount[curr].total + acc, 0);
      const moduleDoneAssignments = typesPerModule.reduce((acc, curr) => assignmentsCount[curr].done + acc, 0);
      modulesDict[module.id] = {
        moduleTotalAssignments,
        moduleDoneAssignments,
        assignmentsCount,
      };
    });

    return modulesDict;
  }, [modules]);

  const cohortProgress = useMemo(() => {
    if (!modulesProgress) return null;

    const allModules = Object.values(modulesProgress);
    const totalAssignments = allModules.reduce((acc, curr) => curr.moduleTotalAssignments + acc, 0);
    const doneAssignments = allModules.reduce((acc, curr) => curr.moduleDoneAssignments + acc, 0);

    const percentage = Math.floor((doneAssignments * 100) / 100);

    return {
      totalAssignments,
      doneAssignments,
      percentage,
    };
  }, [modulesProgress]);

  const getColorVariations = (colorHex) => {
    const variations = [0.2, 0.3, 0.8, 0.9];
    const r = parseInt(colorHex.slice(1, 3), 16); // r = 102
    const g = parseInt(colorHex.slice(3, 5), 16); // g = 51
    const b = parseInt(colorHex.slice(5, 7), 16); // b = 153

    const [light1, light2, light3, light4] = variations.map((variation) => {
      const tintR = Math.round(Math.min(255, r + (255 - r) * variation)); // 117
      const tintG = Math.round(Math.min(255, g + (255 - g) * variation)); // 71
      const tintB = Math.round(Math.min(255, b + (255 - b) * variation)); // 163

      return `#${
        [tintR, tintG, tintB]
          .map((x) => x.toString(16).padStart(2, '0'))
          .join('')}`;
    });

    const [dark1, dark2, dark3, dark4] = variations.map((variation) => {
      const shadeR = Math.round(Math.max(0, r - r * variation)); // 92
      const shadeG = Math.round(Math.max(0, g - g * variation)); // 46
      const shadeB = Math.round(Math.max(0, b - b * variation)); // 138

      return `#${
        [shadeR, shadeG, shadeB]
          .map((x) => x.toString(16).padStart(2, '0'))
          .join('')}`;
    });

    return { light1, light2, light3, light4, dark1, dark2, dark3, dark4 };
  };

  const colorVariations = getColorVariations(cohortColor);

  return (
    <Accordion allowToggle>
      <AccordionItem background={colorVariations.light4} borderRadius="8px" padding="16px" border={`1px solid ${cohortColor}`}>
        {({ isExpanded }) => (
          <>
            <AccordionButton _hover={{ background: 'none' }} padding="0" flexDirection="column" alignItems="flex-start" gap="9px">
              <Box display="flex" justifyContent="space-between" width="100%">
                <Box display="flex" textAlign="left" gap="10px" alignItems="center">
                  <Icon icon="badge" />
                  <Heading size="18px" fontWeight="400">
                    {cohort.name}
                  </Heading>
                  <Box padding="5px 7px" borderRadius="27px" background={colorVariations.light1}>
                    <Text color="white">
                      {t('modules-count', { count: modules?.length })}
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
              {cohortProgress && (
                <Box borderRadius="4px" padding="8px" background={colorVariations.light3} width="100%">
                  <Text textAlign="left" size="md" mb="5px">
                    {t('path-to-claim')}
                  </Text>
                  <Progress progressColor={cohortColor} percents={cohortProgress.percentage} barHeight="8px" borderRadius="4px" />
                  <Text textAlign="left" mt="5px" size="md">
                    {`${cohortProgress.percentage}%`}
                  </Text>
                </Box>
              )}
            </AccordionButton>
            <AccordionPanel paddingX="0" display="flex" flexDirection="column" gap="16px">
              {modules?.map((module) => {
                const assignmentsCount = modulesProgress?.[module.id].assignmentsCount;
                const moduleTotalAssignments = modulesProgress?.[module.id].moduleTotalAssignments;
                const moduleDoneAssignments = modulesProgress?.[module.id].moduleDoneAssignments;

                const typesPerModule = Object.keys(assignmentsCount);

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
                      {typesPerModule.map((taskType) => {
                        const { icon, total, done } = assignmentsCount[taskType];
                        return (
                          <Box background={colorVariations.light3} padding="4px 8px" borderRadius="18px" display="flex" gap="5px" alignItems="center">
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
  modules: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
};

CohortModules.defaultProps = {
  modules: null,
};

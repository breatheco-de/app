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
import useModuleHandler from '../../common/hooks/useModuleHandler';
import useStyle from '../../common/hooks/useStyle';
import Heading from '../../common/components/Heading';
import Text from '../../common/components/Text';
import Icon from '../../common/components/Icon';
import Progress from '../../common/components/ProgressBar/Progress';

function CohortModules({ cohort, modules }) {
  const { t, lang } = useTranslation('dashboard');
  const langDict = {
    en: 'us',
    us: 'us',
  };
  const [loadingStartCourse, setLoadingStartCourse] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { featuredLight, backgroundColor, hexColor } = useStyle();
  const { startDay } = useModuleHandler();
  const { serializeModulesMap, microCohortsAssignments, setMicroCohortsAssinments } = useCohortHandler();

  const cohortColor = cohort.color;

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

  useEffect(() => {
    console.log('modules changed!!!');
    console.log(modules);
  }, [modules]);

  const modulesProgress = useMemo(() => {
    if (!modules || !Array.isArray(modules)) return null;

    const modulesDict = {};
    modules.forEach((module) => {
      const assignmentsCount = module.modules.reduce(getModulesProgress, {});

      const typesPerModule = Object.keys(assignmentsCount);
      const moduleTotalAssignments = typesPerModule.reduce((acc, curr) => assignmentsCount[curr].total + acc, 0);
      const moduleDoneAssignments = typesPerModule.reduce((acc, curr) => assignmentsCount[curr].done + acc, 0);
      const isStarted = module.filteredModules.length > 0;
      modulesDict[module.id] = {
        moduleTotalAssignments,
        moduleDoneAssignments,
        assignmentsCount,
        isStarted,
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

    const isCohortStarted = allModules.some((module) => module.isStarted);

    return {
      totalAssignments,
      doneAssignments,
      percentage,
      isCohortStarted,
    };
  }, [modulesProgress]);

  const updateMicroCohortModules = (tasks) => {
    const newModules = serializeModulesMap(microCohortsAssignments[cohort.slug].syllabusJson, tasks);
    const allMicroCohortAssignments = {
      ...microCohortsAssignments,
      [cohort.slug]: {
        ...microCohortsAssignments[cohort.slug],
        modules: newModules,
        tasks: [...microCohortsAssignments[cohort.slug].tasks, tasks],
      },
    };

    setMicroCohortsAssinments(allMicroCohortAssignments);
  };

  const startCourse = async () => {
    try {
      const firstModule = modules[0];

      const moduleToUpdate = firstModule?.modules;
      const newTasks = moduleToUpdate?.map((l) => ({
        ...l,
        associated_slug: l.slug,
        cohort: cohort.id,
      }));

      setLoadingStartCourse(true);
      await startDay({ newTasks, customHandler: updateMicroCohortModules, updateContext: false });
      setLoadingStartCourse(false);
    } catch (e) {
      console.log(e);
      setLoadingStartCourse(false);
    }
  };

  const getColorVariations = (colorHex) => {
    const variations = [0.2, 0.3, 0.5, 0.8, 0.9];
    const r = parseInt(colorHex.slice(1, 3), 16); // r = 102
    const g = parseInt(colorHex.slice(3, 5), 16); // g = 51
    const b = parseInt(colorHex.slice(5, 7), 16); // b = 153

    const [light1, light2, light3, light4, light5] = variations.map((variation) => {
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

    return { light1, light2, light3, light4, light5, dark1, dark2, dark3, dark4 };
  };

  const colorVariations = getColorVariations(cohortColor);

  const redirectToModule = (module) => {
    const { isStarted } = modulesProgress[module.id];
    //start module
    if (!isStarted) {
      console.log('hola');
    }
  };

  return (
    <Accordion allowToggle>
      <AccordionItem background={colorVariations.light5} borderRadius="8px" padding="16px" border={`1px solid ${cohortColor}`}>
        {({ isExpanded }) => (
          <>
            <AccordionButton cursor={cohortProgress?.isCohortStarted ? 'pointer' : 'auto'} _hover={{ background: 'none' }} padding="0" flexDirection="column" alignItems="flex-start" gap="9px">
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
                {cohortProgress?.isCohortStarted && (
                  <Box display="flex" gap="5px" alignItems="center">
                    <Text>
                      {t(isExpanded ? 'hide-content' : 'show-content')}
                    </Text>
                    <AccordionIcon />
                  </Box>
                )}
              </Box>
              {cohortProgress?.isCohortStarted && (
                <Box borderRadius="4px" padding="8px" background={colorVariations.light4} width="100%">
                  <Text textAlign="left" size="md" mb="5px">
                    {t('path-to-claim')}
                  </Text>
                  <Box position="relative">
                    <Progress width="calc(100% - 35px)" progressColor={cohortColor} percents={cohortProgress.percentage} barHeight="8px" borderRadius="4px" />
                    {cohortProgress.percentage !== 100 ? (
                      <Box position="absolute" right="0" top="-15px" display="flex" flexDirection="column" justifyContent="center" width="40px" height="40px" border="2px solid white" borderRadius="full" background={colorVariations.light4}>
                        <Icon
                          icon="party-popper-off"
                          style={{ margin: 'auto' }}
                          props={{
                            color: colorVariations.light5,
                            color2: colorVariations.light3,
                          }}
                        />
                      </Box>
                    ) : (
                      <Icon
                        icon="party-popper"
                        style={{
                          margin: 'auto',
                          position: 'absolute',
                          right: '0',
                          top: '-25px',
                        }}
                      />
                    )}
                  </Box>
                  <Text textAlign="left" mt="5px" size="md">
                    {`${cohortProgress.percentage}%`}
                  </Text>
                </Box>
              )}
            </AccordionButton>
            {cohortProgress?.isCohortStarted ? (
              <AccordionPanel paddingX="0" display="flex" flexDirection="column" gap="16px">
                {modules?.map((module) => {
                  const assignmentsCount = modulesProgress?.[module.id].assignmentsCount;
                  const moduleTotalAssignments = modulesProgress?.[module.id].moduleTotalAssignments;
                  const moduleDoneAssignments = modulesProgress?.[module.id].moduleDoneAssignments;

                  const typesPerModule = Object.keys(assignmentsCount);

                  return (
                    <Box onClick={() => redirectToModule(module)} background={backgroundColor} cursor="pointer" _hover={{ opacity: 0.7 }} display="flex" alignItems="center" justifyContent="space-between" padding="8px" borderRadius="8px">
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
                            <Box background={colorVariations.light4} padding="4px 8px" borderRadius="18px" display="flex" gap="5px" alignItems="center">
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
            ) : (
              <Button onClick={startCourse} _hover={{ background: colorVariations.light4, opacity: 0.7 }} background={colorVariations.light4} mt="10px" width="100%" color={cohortColor} isLoading={loadingStartCourse}>
                {t('start-course')}
                {' '}
                →
              </Button>
            )}
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

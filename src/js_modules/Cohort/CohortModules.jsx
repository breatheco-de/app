/* eslint-disable no-unused-vars */
import React, { useRef, useMemo, useState, useEffect } from 'react';
import {
  Box,
  Button,
  useColorMode,
  Spinner,
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
import { format } from 'date-fns';
import { es, en } from 'date-fns/locale';
import { useReward } from 'react-rewards';
import useCohortHandler from '../../common/hooks/useCohortHandler';
import useStyle from '../../common/hooks/useStyle';
import Heading from '../../common/components/Heading';
import ShareButton from '../../common/components/ShareButton';
import Text from '../../common/components/Text';
import Icon from '../../common/components/Icon';
import Progress from '../../common/components/ProgressBar/Progress';

const locales = { es, en };

function CohortModules({ cohort, modules, mainCohort, certificate, openByDefault }) {
  const containerRef = useRef(null);
  const { reward } = useReward(cohort.slug, 'confetti', {
    lifetime: 50,
    zIndex: 100,
    spread: 50,
    position: 'absolute',
  });
  const { t, lang } = useTranslation('dashboard');
  const langDict = {
    en: 'us',
    us: 'us',
  };
  const [loadingStartCourse, setLoadingStartCourse] = useState(false);
  const [loadingModule, setLoadingModule] = useState(null);
  const [shareModal, setShareModal] = useState(false);
  const router = useRouter();
  const { backgroundColor, hexColor } = useStyle();
  const { colorMode } = useColorMode();
  const { serializeModulesMap, startDay, cohortsAssignments, setCohortsAssingments } = useCohortHandler();

  const cohortColor = cohort.color || hexColor.blueDefault;
  const isGraduated = !!certificate;

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
      const assignmentsCount = module.content.reduce(getModulesProgress, {});

      const typesPerModule = Object.keys(assignmentsCount);
      const moduleTotalAssignments = typesPerModule.reduce((acc, curr) => assignmentsCount[curr].total + acc, 0);
      const moduleDoneAssignments = typesPerModule.reduce((acc, curr) => assignmentsCount[curr].done + acc, 0);
      const isStarted = module.filteredContent.length > 0;
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

    const percentage = cohort.cohort_user.educational_status === 'GRADUATED' ? 100 : Math.floor((doneAssignments * 100) / 100);

    const isCohortStarted = allModules.some((module) => module.isStarted);

    return {
      totalAssignments,
      doneAssignments,
      percentage,
      isCohortStarted,
    };
  }, [modulesProgress]);

  const updateMicroCohortModules = (tasks) => {
    const cohortModulesUpdated = serializeModulesMap(cohortsAssignments[cohort.slug].syllabus.json.days, tasks);
    const allMicroCohortAssignments = {
      ...cohortsAssignments,
      [cohort.slug]: {
        ...cohortsAssignments[cohort.slug],
        modules: cohortModulesUpdated,
        tasks: [...cohortsAssignments[cohort.slug].tasks, tasks],
      },
    };

    setCohortsAssingments(allMicroCohortAssignments);
  };

  const startCourse = async () => {
    try {
      const firstModule = modules[0];

      const moduleToUpdate = firstModule?.content;
      const newTasks = moduleToUpdate?.map((l) => ({
        ...l,
        associated_slug: l.slug,
        cohort: cohort.id,
      }));

      setLoadingStartCourse(true);
      await startDay({ newTasks, cohort });
      setLoadingStartCourse(false);
    } catch (e) {
      console.log(e);
      setLoadingStartCourse(false);
    }
  };

  const getColorVariations = (colorHex) => {
    if (!colorHex) return {};
    const lightRange = [0.2, 0.3, 0.5, 0.8, 0.9];
    const darkRange = [0.2, 0.3, 0.4, 0.7, 0.8];
    const r = parseInt(colorHex.slice(1, 3), 16); // r = 102
    const g = parseInt(colorHex.slice(3, 5), 16); // g = 51
    const b = parseInt(colorHex.slice(5, 7), 16); // b = 153

    const [light1, light2, light3, light4, light5] = lightRange.map((variation) => {
      const tintR = Math.round(Math.min(255, r + (255 - r) * variation)); // 117
      const tintG = Math.round(Math.min(255, g + (255 - g) * variation)); // 71
      const tintB = Math.round(Math.min(255, b + (255 - b) * variation)); // 163

      return `#${
        [tintR, tintG, tintB]
          .map((x) => x.toString(16).padStart(2, '0'))
          .join('')}`;
    });

    const [dark1, dark2, dark3, dark4, dark5] = darkRange.map((variation) => {
      const shadeR = Math.round(Math.max(0, r - r * variation)); // 92
      const shadeG = Math.round(Math.max(0, g - g * variation)); // 46
      const shadeB = Math.round(Math.max(0, b - b * variation)); // 138

      return `#${
        [shadeR, shadeG, shadeB]
          .map((x) => x.toString(16).padStart(2, '0'))
          .join('')}`;
    });

    return {
      light: {
        mode1: light1, mode2: light2, mode3: light3, mode4: light4, mode5: light5,
      },
      dark: {
        mode1: dark1, mode2: dark2, mode3: dark3, mode4: dark4, mode5: dark5,
      },
    };
  };

  const colorVariations = getColorVariations(cohortColor);

  const redirectToModule = async (module) => {
    try {
      const { isStarted } = modulesProgress[module.id];
      //start module
      if (!isStarted) {
        const moduleToUpdate = module?.content;
        const newTasks = moduleToUpdate?.map((l) => ({
          ...l,
          associated_slug: l.slug,
          cohort: cohort.id,
        }));

        setLoadingModule(module.id);
        await startDay({ newTasks, cohort });
        setLoadingModule(null);
      }

      const moduleFirstAssignment = module?.content[0];

      let syllabusRoute = `/syllabus/${cohort.slug}/${moduleFirstAssignment.type.toLowerCase()}/${moduleFirstAssignment.slug}`;
      if (mainCohort) syllabusRoute = `/main-cohort/${mainCohort.slug}/${syllabusRoute}`;

      router.push(syllabusRoute);
    } catch (e) {
      console.log(e);
      setLoadingModule(null);
    }
  };

  const progressBoxStyles = () => {
    if (!isGraduated) {
      return {
        paddingY: '8px',
        background: colorVariations[colorMode].mode4,
      };
    }

    return {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      justifyContent: 'space-between',
    };
  };

  const certfToken = certificate?.preview_url && certificate.preview_url?.split('/')?.pop();
  const certfLink = certfToken ? `https://certificate.4geeks.com/${certfToken}` : '#';
  const profession = certificate?.specialty.name;
  const socials = t('profile:share-certificate.socials', { certfLink, profession }, { returnObjects: true });

  const share = (e) => {
    e.stopPropagation();
    setShareModal(true);
  };

  const showCertificate = (e) => {
    e.stopPropagation();
    window.open(certfLink);
  };

  useEffect(() => {
    if (certificate) {
      setTimeout(() => {
        reward();
      }, 1500);
    }
  }, [certificate]);

  return (
    <Accordion defaultIndex={openByDefault && 0} allowToggle>
      <AccordionItem background={colorVariations[colorMode].mode5} borderRadius="8px" padding="16px" border={`1px solid ${cohortColor}`}>
        {({ isExpanded }) => (
          <>
            <AccordionButton ref={containerRef} position="relative" cursor={cohortProgress?.isCohortStarted ? 'pointer' : 'auto'} _hover={{ background: 'none' }} padding="0" flexDirection="column" alignItems="flex-start" gap="9px">
              <Box display="flex" justifyContent="space-between" width="100%" gap="10px">
                <Box display="flex" textAlign="left" gap="10px" alignItems="center" width="100%">
                  <Box display="flex" gap="10px" alignItems="center" minWidth="fit-content">
                    <Icon icon="badge" />
                    <Heading size="18px" fontWeight="400">
                      {cohort.name}
                    </Heading>
                  </Box>
                  <Box display={{ base: 'none', md: 'flex' }} gap="10px" alignItems="center" justifyContent="space-between" width="100%">
                    {isGraduated && (
                      <Box padding="5px 7px" borderRadius="27px" background="yellow.default">
                        <Text color="white">
                          {t('completed')}
                        </Text>
                      </Box>
                    )}
                    <Box padding="5px 7px" borderRadius="27px" background={colorVariations[colorMode].mode1}>
                      <Text color="white">
                        {t('modules-count', { count: modules?.length })}
                      </Text>
                    </Box>
                  </Box>
                </Box>
                {cohortProgress?.isCohortStarted && (
                  <Box display="flex" gap="5px" alignItems="center" minWidth="fit-content">
                    <Text>
                      {t(isExpanded ? 'hide-content' : 'show-content')}
                    </Text>
                    <AccordionIcon />
                  </Box>
                )}
              </Box>
              <Box display={{ base: 'flex', md: 'none' }} gap="10px" alignItems="center" justifyContent="space-between" width="100%">
                {isGraduated && (
                  <Box padding="5px 7px" borderRadius="27px" background="yellow.default">
                    <Text color="white">
                      {t('completed')}
                    </Text>
                  </Box>
                )}
                <Box padding="5px 7px" borderRadius="27px" background={colorVariations[colorMode].mode1}>
                  <Text color="white">
                    {t('modules-count', { count: modules?.length })}
                  </Text>
                </Box>
              </Box>
              <Box mt={isGraduated && '10px'} width="100%" display="flex">
                {isGraduated && (
                  <Box onClick={showCertificate} display="flex" flexDirection="column" gap="10px" background={colorVariations[colorMode].mode4} borderRadius="4px" padding="8px 16px">
                    <Icon
                      icon="certificate-2"
                      props={{
                        color: cohortColor,
                        color2: colorVariations[colorMode].mode4,
                      }}
                      onClick={showCertificate}
                    />
                    <Text color={cohortColor}>
                      {t('open')}
                    </Text>
                  </Box>
                )}
                {cohortProgress?.isCohortStarted && (
                  <Box borderRadius="4px" paddingX="8px" width="100%" {...progressBoxStyles()}>
                    <Box display="flex">
                      <Box width="100%">
                        <Text textAlign="left" size="md" mb="5px" display={isGraduated && 'none'}>
                          {t('path-to-claim')}
                        </Text>
                        <Box position="relative">
                          <Progress width="calc(100% - 35px)" progressColor={cohortColor} percents={cohortProgress.percentage} barHeight="8px" borderRadius="4px" />
                          {cohortProgress.percentage !== 100 ? (
                            <Box position="absolute" right="0" top="-15px" display="flex" flexDirection="column" justifyContent="center" width="40px" height="40px" border="2px solid" borderColor={colorVariations[colorMode].mode5} borderRadius="full" background={colorVariations[colorMode].mode4}>
                              <Icon
                                icon="certificate-small"
                                style={{ margin: 'auto' }}
                                color={colorVariations[colorMode].mode5}
                              />
                            </Box>
                          ) : (
                            <Box
                              id={cohort.slug}
                              style={{
                                margin: 'auto',
                                position: 'absolute',
                                right: '0',
                                top: '-25px',
                              }}
                            >
                              <Icon
                                icon="party-popper"
                              />
                            </Box>
                          )}
                        </Box>
                        <Text textAlign="left" mt="5px" size="md" display={isGraduated && 'none'}>
                          {`${cohortProgress.percentage}%`}
                        </Text>
                      </Box>
                    </Box>
                    {isGraduated && (
                      <Box mt={{ base: '10px', sm: '0' }} display="flex" alignItems={{ base: 'baseline', sm: 'center' }} gap="10px" flexDirection={{ base: 'column-reverse', sm: 'row' }}>
                        <Box display="flex" alignItems="center" gap="5px">
                          <Icon icon="clock" width="14px" height="14px" color={cohortColor} />
                          <Text size="md" textAlign="left">
                            {t('hours-worked', { hours: cohort.syllabus_version.duration_in_hours })}
                          </Text>
                        </Box>
                        <Box display="flex" alignItems="center" gap="5px">
                          <Icon icon="attendance" color={cohortColor} />
                          <Text size="md" textAlign="left">
                            {t('issued-on', { date: format(new Date(certificate.issued_at), 'MMMM d y', {
                              locale: locales[lang],
                            }) })}
                          </Text>
                        </Box>
                        {shareModal && (
                          <ShareButton
                            title={t('profile:share-certificate.title')}
                            shareText={t('profile:share-certificate.shareText')}
                            link={certfLink}
                            socials={socials}
                            alignItems="center"
                            gap="5px"
                            height="40px"
                            onlyModal
                            onClose={() => setShareModal(false)}
                          />
                        )}
                        <Button onClick={share} width="fit-content" display="flex" alignItems="center" gap="5px" color="white" background={cohortColor} _hover={{ background: cohortColor, opacity: 0.7 }}>
                          <Icon icon="share" />
                          {t('share')}
                        </Button>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </AccordionButton>
            {cohortProgress?.isCohortStarted ? (
              <AccordionPanel paddingX="0" display="flex" flexDirection="column" gap="16px">
                {modules?.map((module) => {
                  const assignmentsCount = modulesProgress?.[module.id].assignmentsCount;
                  const moduleTotalAssignments = modulesProgress?.[module.id].moduleTotalAssignments;
                  const moduleDoneAssignments = modulesProgress?.[module.id].moduleDoneAssignments;

                  const typesPerModule = Object.keys(assignmentsCount);

                  return (
                    <Box key={getModuleLabel(module)} onClick={() => redirectToModule(module)} background={backgroundColor} cursor="pointer" _hover={{ opacity: 0.7 }} display="flex" alignItems="center" justifyContent="space-between" padding="8px" borderRadius="8px">
                      <Box display="flex" alignItems="center" gap="16px">
                        {loadingModule === module.id ? (
                          <Spinner color={cohortColor} />
                        ) : (
                          <>
                            {moduleTotalAssignments === moduleDoneAssignments ? (
                              <Icon icon="verified" width="26px" height="26px" color={hexColor.green} />
                            ) : (
                              <CircularProgress color={hexColor.green} size="26px" value={(moduleDoneAssignments * 100) / moduleTotalAssignments} />
                            )}
                          </>
                        )}
                        <Text size="md">
                          {getModuleLabel(module)}
                        </Text>
                      </Box>
                      <Box display={{ base: 'none', sm: 'flex' }} alignItems="center" gap="16px">
                        {typesPerModule.map((taskType) => {
                          const { icon, total, done } = assignmentsCount[taskType];
                          return (
                            <Box background={colorVariations[colorMode].mode4} padding="4px 8px" borderRadius="18px" display="flex" gap="5px" alignItems="center">
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
              <Button onClick={startCourse} _hover={{ background: colorVariations[colorMode].mode4, opacity: 0.7 }} background={colorVariations[colorMode].mode4} mt="10px" width="100%" color={cohortColor} isLoading={loadingStartCourse}>
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
  mainCohort: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  certificate: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  openByDefault: PropTypes.bool,
};

CohortModules.defaultProps = {
  mainCohort: null,
  modules: null,
  certificate: null,
  openByDefault: false,
};

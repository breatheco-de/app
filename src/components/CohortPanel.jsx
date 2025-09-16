/* eslint-disable react/prop-types */
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useDisclosure,
  VStack,
  Image,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { es, en } from 'date-fns/locale';
import { useReward } from 'react-rewards';
import useCohortHandler from '../hooks/useCohortHandler';
import useStyle from '../hooks/useStyle';
import Heading from './Heading';
import ShareButton from './ShareButton';
import Text from './Text';
import Icon from './Icon';
import Progress from './ProgressBar/Progress';
import { stages } from './ReviewModal';
import { getColorVariations } from '../utils';
import useSocialShare from '../hooks/useSocialShare';

const locales = { es, en };

function CohortPanel({ cohort, modules, mainCohort, certificate, openByDefault, tasks }) {
  const containerRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(openByDefault);
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
  const { isOpen: isCertificateModalOpen, onOpen: onCertificateModalOpen, onClose: onCertificateModalClose } = useDisclosure();

  const {
    startDay,
    cohortsAssignments,
    handleOpenReviewModal,
    getMandatoryProjects,
  } = useCohortHandler();

  const cohortColor = cohort.color || hexColor.blueDefault;
  const isGraduated = !!certificate;

  const getModuleLabel = (module) => {
    if (typeof module.label === 'string') return module.label;
    if (lang in module.label) return module.label[lang];
    return module.label[langDict[lang]];
  };

  const isTaskApproved = (task) => {
    if (task.task_type === 'PROJECT') {
      return task.revision_status === 'APPROVED';
    }
    return task.task_status === 'DONE';
  };

  const modulesProgress = useMemo(() => {
    if (!modules || !Array.isArray(modules) || !cohortsAssignments?.[cohort.slug]?.tasks) return null;

    const modulesDict = {};

    const pendingRevisions = cohortsAssignments[cohort.slug].tasks.filter((task) => task.reviewed_at !== null && (task.reviewed_at > task.read_at || task.read_at === null));

    modules.forEach((module) => {
      const assignmentsCount = module.content.reduce((acc, curr) => {
        const isApproved = isTaskApproved(curr);
        const isRejected = curr.revision_status === 'REJECTED';
        const isPendingProject = curr.task_type === 'PROJECT' && curr.revision_status === 'PENDING' && curr.task_status === 'DONE';
        if (!(curr.task_type in acc)) {
          // Check if any assignment in the module has a pending revision
          const pendingRevisionsCount = module.content.filter((assignment) => pendingRevisions.some((task) => task.associated_slug === assignment.slug && task.task_type === curr.task_type)).length;

          acc[curr.task_type] = {
            total: 1,
            icon: curr.icon,
            done: curr.task_status === 'DONE' ? 1 : 0,
            pendingRevision: pendingRevisionsCount,
            approved: isApproved ? 1 : 0,
            rejected: isRejected ? 1 : 0,
            pending: isPendingProject ? 1 : 0,
          };
        } else {
          acc[curr.task_type].total += 1;
          if (curr.task_status === 'DONE') acc[curr.task_type].done += 1;
          if (isApproved) acc[curr.task_type].approved += 1;
          if (isRejected) acc[curr.task_type].rejected += 1;
          if (isPendingProject) acc[curr.task_type].pending += 1;
        }
        return acc;
      }, {});

      const typesPerModule = Object.keys(assignmentsCount);
      const moduleTotalAssignments = typesPerModule.reduce((acc, curr) => assignmentsCount[curr].total + acc, 0);
      const moduleDoneAssignments = typesPerModule.reduce((acc, curr) => assignmentsCount[curr].done + acc, 0);
      const moduleApprovedAssignments = typesPerModule.reduce((acc, curr) => assignmentsCount[curr].approved + acc, 0);
      const moduleRejectedAssignments = typesPerModule.reduce((acc, curr) => assignmentsCount[curr].rejected + acc, 0);
      const hasPendingRevisions = typesPerModule.some((taskType) => assignmentsCount[taskType].pendingRevision > 0);
      const isStarted = module.filteredContent.length > 0;

      modulesDict[module.id] = {
        moduleTotalAssignments,
        moduleDoneAssignments,
        moduleApprovedAssignments,
        moduleRejectedAssignments,
        assignmentsCount,
        hasPendingRevisions,
        isStarted,
      };
    });

    return modulesDict;
  }, [modules, tasks, cohortsAssignments, cohort.slug]);

  const cohortProgress = useMemo(() => {
    if (!modulesProgress) return null;

    const allModules = Object.values(modulesProgress);
    const totalAssignments = allModules.reduce((acc, curr) => curr.moduleTotalAssignments + acc, 0);
    const approvedAssignments = allModules.reduce((acc, curr) => curr.moduleApprovedAssignments + acc, 0);
    const rejectedAssignments = allModules.reduce((acc, curr) => curr.moduleRejectedAssignments + acc, 0);
    const hasPendingRevisions = allModules.some((module) => module.hasPendingRevisions);

    const percentage = cohort.cohort_user.educational_status === 'GRADUATED' ? 100 : Math.ceil((approvedAssignments * 100) / (totalAssignments || 1));

    const isCohortStarted = allModules.some((module) => module.isStarted);

    return {
      totalAssignments,
      approvedAssignments,
      rejectedAssignments,
      percentage,
      isCohortStarted,
      hasPendingRevisions,
    };
  }, [modulesProgress, cohort.cohort_user.educational_status]);

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
      setIsExpanded(true);
    } catch (e) {
      console.log(e);
      setLoadingStartCourse(false);
    }
  };

  const colorVariations = getColorVariations(cohortColor);

  const redirectToModule = async (module) => {
    try {
      const { isStarted: moduleIsStarted } = modulesProgress?.[module.id] || {};
      // Verificar si hay nuevas actividades
      const hasNewActivities = module?.content?.length > (module?.filteredContent?.length || 0);
      // Si hay nuevas actividades o el módulo no ha comenzado, actualizar las tareas
      if (hasNewActivities || !moduleIsStarted) {
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

      const moduleFirstAssignment = module?.content?.[0];
      if (!moduleFirstAssignment) return;

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
        background: colorVariations[colorMode]?.mode4 || hexColor.lightColor,
      };
    }

    return {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      justifyContent: 'space-between',
    };
  };

  const certfToken = certificate?.preview_url?.split('/')?.pop();

  const { socials, shareLink: certfLink } = useSocialShare({
    info: certfToken,
    type: 'certificate',
    shareMessage: t('profile:share-certificate.shareMessage', { profession: certificate?.specialty?.name }),
  });

  const share = (e) => {
    e.stopPropagation();
    setShareModal(true);
  };

  const showFeedback = (e) => {
    e.stopPropagation();
    handleOpenReviewModal({ defaultStage: stages.pending_activities, cohortSlug: cohort.slug, fixedStage: true });
  };

  useEffect(() => {
    if (certificate) {
      setTimeout(() => {
        reward?.();
      }, 1500);
    }
  }, [certificate]);

  const mandatoryProjects = getMandatoryProjects(cohort.slug);
  const hasPendingRevisions = cohortProgress?.hasPendingRevisions || false;

  const ContainerComponent = isGraduated ? Box : AccordionItem;
  const containerProps = isGraduated ? {
    background: `linear-gradient(to right, ${colorVariations[colorMode]?.mode5 || backgroundColor}, ${colorVariations[colorMode]?.mode2 || backgroundColor})`,
    borderRadius: '8px',
    padding: '8px',
    border: `1px solid ${cohortColor}`,
    position: 'relative',
    overflow: 'visible',
    sx: {
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '-35px',
        left: '10px',
        right: '10px',
        height: '60px',
        backgroundImage: "url('/static/images/confeti-strip.svg')",
        backgroundRepeat: 'repeat-x',
        backgroundSize: 'auto 100%',
      },
    },
  } : {
    background: colorVariations[colorMode]?.mode5 || backgroundColor,
    borderRadius: '8px',
    padding: '16px',
    border: `1px solid ${cohortColor}`,
  };

  const InnerContainerComponent = isGraduated ? AccordionItem : React.Fragment;
  const innerContainerProps = isGraduated ? {
    background: 'transparent',
    border: 'none',
    padding: '0',
  } : {};

  const ContentWrapperComponent = isGraduated ? Box : React.Fragment;
  const contentWrapperProps = isGraduated ? {
    background: colorVariations[colorMode]?.mode5 || backgroundColor,
    borderRadius: '8px',
    padding: '16px',
  } : {};

  return (
    <>
      <Accordion index={isExpanded ? 0 : -1} onChange={(index) => setIsExpanded(index === 0)} allowToggle>
        <ContainerComponent {...containerProps}>
          <InnerContainerComponent {...innerContainerProps}>
            <ContentWrapperComponent {...contentWrapperProps}>
              <AccordionButton as="div" ref={containerRef} position="relative" cursor={cohortProgress?.isCohortStarted ? 'pointer' : 'auto'} _hover={{ background: 'none' }} padding="0" flexDirection="column" alignItems="flex-start" gap="9px">
                <Box display="flex" justifyContent="space-between" width="100%" gap="10px">
                  <Box display="flex" textAlign="left" gap="10px" alignItems="center" width="100%">
                    <Box display="flex" gap="10px" alignItems="center" minWidth="fit-content">
                      <Icon icon="badge" width="24px" height="24px" />
                      <Heading size="18px" fontWeight="400">
                        {cohort.name}
                      </Heading>
                    </Box>
                    <Box display={{ base: 'none', md: 'flex' }} gap="10px" alignItems="center" width="100%">
                      {isGraduated && (
                        <Box padding="5px 7px" borderRadius="27px" background="yellow.default">
                          <Text color="white">
                            {t('completed')}
                          </Text>
                        </Box>
                      )}
                      <Box padding="5px 7px" borderRadius="27px" background={colorVariations[colorMode]?.mode1 || hexColor.blueDefault}>
                        <Text color="white">
                          {t('modules-count', { count: modules?.length })}
                        </Text>
                      </Box>
                      {(mandatoryProjects.length > 0 || hasPendingRevisions) && (
                        <Button maxHeight="28px" onClick={showFeedback} padding="5px 7px" borderRadius="27px" background="yellow.light" display="flex" gap="5px" alignItems="center" fontWeight="400">
                          <Icon icon="comment" width="14px" height="14px" color={hexColor.blueDefault} />
                          <Text as="span" color="black">
                            {t(hasPendingRevisions ? 'feedback-pending' : 'pending-activities')}
                          </Text>
                        </Button>
                      )}
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
                  <Box padding="5px 7px" borderRadius="27px" background={colorVariations[colorMode]?.mode1 || hexColor.blueDefault}>
                    <Text color="white">
                      {t('modules-count', { count: modules?.length })}
                    </Text>
                  </Box>
                </Box>
                <Box mt={isGraduated && '10px'} width="100%" display="flex">
                  {isGraduated && (
                    <Box onClick={onCertificateModalOpen} justifyContent="center" display="flex" flexDirection="column" gap="10px" background={colorVariations[colorMode]?.mode4 || hexColor.lightColor} borderRadius="4px" padding="8px 16px">
                      <Icon
                        icon="certificate-2"
                        props={{
                          color: cohortColor,
                          color2: colorVariations[colorMode]?.mode4 || hexColor.lightColor,
                        }}
                        width="90px"
                        height="80px"
                      />
                      <Text color={cohortColor} textAlign="center">
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
                          <Box position="relative" mt={{ base: '0', md: isGraduated && '20px' }}>
                            <Progress width="calc(100% - 35px)" progressColor={cohortColor} percents={cohortProgress?.percentage || 0} barHeight="8px" borderRadius="4px" />
                            {cohortProgress?.percentage !== 100 ? (
                              <Box position="absolute" right="0" top="-15px" display="flex" flexDirection="column" justifyContent="center" width="40px" height="40px" border="2px solid" borderColor={colorVariations[colorMode]?.mode5 || backgroundColor} borderRadius="full" background={colorVariations[colorMode]?.mode4 || hexColor.lightColor}>
                                <Icon
                                  icon="certificate-small"
                                  style={{ margin: 'auto' }}
                                  color={colorVariations[colorMode]?.mode5 || backgroundColor}
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
                            {`${cohortProgress?.percentage || 0}%`}
                          </Text>
                        </Box>
                      </Box>
                      {isGraduated && (
                        <Box
                          mt={{ base: '20px', sm: '0' }}
                          display="flex"
                          alignItems={{ base: 'baseline', sm: 'center' }}
                          gap={{ base: '10px', md: '50px' }}
                          flexDirection={{ base: 'column-reverse', sm: 'row' }}
                        >
                          <Box display="flex" alignItems="center" gap="5px">
                            <Icon icon="clock" width="14px" height="14px" color={cohortColor} />
                            <Text size="md" textAlign="left">
                              {t('hours-worked', { hours: cohort.syllabus_version.duration_in_hours })}
                            </Text>
                          </Box>
                          <Box display="flex" alignItems="center" gap="5px">
                            <Icon icon="attendance" color={cohortColor} />
                            <Text size="md" textAlign="left">
                              {t('issued-on', {
                                date: format(new Date(certificate.issued_at), 'MMMM d, y', {
                                  locale: locales[lang],
                                }),
                              })}
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
                    const assignmentsCount = modulesProgress?.[module.id]?.assignmentsCount;
                    const moduleTotalAssignments = modulesProgress?.[module.id]?.moduleTotalAssignments;
                    const moduleApprovedAssignments = modulesProgress?.[module.id]?.moduleApprovedAssignments;

                    const typesPerModule = assignmentsCount ? Object.keys(assignmentsCount) : [];
                    const moduleLabel = getModuleLabel(module);

                    return (
                      <Box key={moduleLabel} onClick={() => redirectToModule(module)} background={backgroundColor} cursor="pointer" _hover={{ opacity: 0.7 }} display="flex" alignItems="center" justifyContent="space-between" padding="8px" borderRadius="8px">
                        <Box display="flex" alignItems="center" gap="16px">
                          {loadingModule === module.id ? (
                            <Spinner color={cohortColor} />
                          ) : (
                            <>
                              {(() => {
                                // Get the 'isStarted' status for this specific module
                                const moduleIsStarted = modulesProgress?.[module.id]?.isStarted;

                                if (!moduleIsStarted) { // Case 1: Not started at all
                                  return (
                                    <Box
                                      display="flex"
                                      justifyContent="center"
                                      alignItems="center"
                                      borderRadius="full"
                                      width="26px"
                                      height="26px"
                                      bg={cohortColor}
                                    >
                                      <Icon icon="play" width="12px" height="12px" color="white" />
                                    </Box>
                                  );
                                } if (moduleTotalAssignments === moduleApprovedAssignments) { // Case 2: Started and Complete
                                  return (
                                    <Icon icon="verified" width="26px" height="26px" color={hexColor.green} />
                                  );
                                } // else: Case 3: Started but In Progress (including 0 done)
                                return (
                                  <CircularProgress color={hexColor.green} size="26px" value={(moduleApprovedAssignments * 100) / (moduleTotalAssignments || 1)} />
                                );
                              })()}
                            </>
                          )}
                          <Text size="md">
                            {moduleLabel}
                          </Text>
                        </Box>
                        <Box display={{ base: 'none', sm: 'flex' }} alignItems="center" gap="16px">
                          {typesPerModule.map((taskType) => {
                            const { icon, total, done, pendingRevision, approved, rejected, pending } = assignmentsCount[taskType];
                            return (
                              <Box
                                key={`${moduleLabel}-${taskType}`}
                                background={colorVariations[colorMode]?.mode4 || hexColor.lightColor}
                                padding="4px 8px"
                                borderRadius="18px"
                                display="flex"
                                gap="5px"
                                alignItems="center"
                                position="relative"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (pendingRevision > 0) handleOpenReviewModal({ defaultStage: stages.pending_activities, cohortSlug: cohort.slug, fixedStage: true });
                                  else redirectToModule(module);
                                }}
                              >
                                <Icon icon={icon} color={cohortColor} width="13px" height="13px" />
                                <Text>
                                  {`${done}/`}
                                  {total}
                                </Text>
                                {approved === total && <Icon icon="checked2" color={hexColor.green} />}
                                {rejected > 0 && (
                                  <Box border="5px solid" borderColor="danger" borderRadius="100%" color="danger" position="relative">
                                    <Box
                                      position="absolute"
                                      top="50%"
                                      left="50%"
                                      transform="translate(-50%, -50%)"
                                      borderRadius="full"
                                      border="2px solid"
                                      borderColor={hexColor.white2}
                                    />
                                  </Box>
                                )}
                                {pending > 0 && (
                                  <Box border="5px solid" borderColor="yellow.default" borderRadius="100%" position="relative">
                                    <Box
                                      position="absolute"
                                      top="50%"
                                      left="50%"
                                      transform="translate(-50%, -50%)"
                                      borderRadius="full"
                                      border="2px solid"
                                      borderColor={hexColor.white2}
                                    />
                                  </Box>
                                )}
                                {pendingRevision > 0 && rejected > 0 && (
                                  <Box
                                    position="absolute"
                                    top="18px"
                                    left="8px"
                                    background="yellow.default"
                                    color="black"
                                    borderRadius="full"
                                    width="14px"
                                    height="14px"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    fontSize="8px"
                                    fontWeight="bold"
                                  >
                                    {pendingRevision}
                                  </Box>
                                )}
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    );
                  })}
                </AccordionPanel>
              ) : (
                <Button onClick={startCourse} _hover={{ background: colorVariations[colorMode]?.mode4 || hexColor.lightColor, opacity: 0.7 }} background={colorVariations[colorMode]?.mode4 || hexColor.lightColor} mt="10px" width="100%" color={cohortColor} isLoading={loadingStartCourse}>
                  {t('start-course')}
                  {' '}
                  →
                </Button>
              )}
            </ContentWrapperComponent>
          </InnerContainerComponent>
        </ContainerComponent>
      </Accordion>

      <Modal isOpen={isCertificateModalOpen} onClose={onCertificateModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalBody padding="10px">
            <VStack spacing={4} align="stretch" flexDirection="column" borderRadius="8px">
              {certificate?.preview_url ? (
                <Image src={certificate?.preview_url} width="100%" height="400px" border="none" flexGrow={1} title={t('certificate-preview-title')} />
              ) : (
                <Text>{t('certificate-preview-unavailable')}</Text>
              )}
              <Box display="flex" flexDirection="column" gap="10px">
                <Box display="flex" flexDirection="column" gap="10px">
                  <Text size="14px" fontWeight="bold">{t('certificate-hooray')}</Text>
                  <Box display="flex" gap="10px" alignItems="center" minWidth="fit-content">
                    <Icon icon="badge" width="24px" height="24px" />
                    <Heading size="18px" fontWeight="400">
                      {cohort.name}
                    </Heading>
                  </Box>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Box display="flex" gap="20px">
                    <Box display="flex" alignItems="center" gap="10px">
                      <Icon icon="clock" width="14px" height="14px" color={cohortColor} />
                      <Text size="md" textAlign="left">
                        {t('hours-worked', { hours: cohort.syllabus_version.duration_in_hours })}
                      </Text>
                    </Box>
                    {certificate?.issued_at && (
                      <Box display="flex" alignItems="center" gap="10px">
                        <Icon icon="attendance" color={cohortColor} />
                        <Text size="md" textAlign="left">
                          {t('issued-on', {
                            date: format(new Date(certificate?.issued_at), 'MMMM d y', {
                              locale: locales[lang],
                            }),
                          })}
                        </Text>
                      </Box>
                    )}
                  </Box>
                  <Button onClick={share} width="fit-content" display="flex" alignItems="center" gap="5px" color="white" background={cohortColor} _hover={{ background: cohortColor, opacity: 0.7 }}>
                    <Icon icon="share" />
                    {t('share')}
                  </Button>
                </Box>
              </Box>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default CohortPanel;

CohortPanel.propTypes = {
  cohort: PropTypes.oneOfType([PropTypes.any]).isRequired,
  modules: PropTypes.oneOfType([PropTypes.any]),
  tasks: PropTypes.oneOfType([PropTypes.any]),
  mainCohort: PropTypes.oneOfType([PropTypes.any]),
  certificate: PropTypes.oneOfType([PropTypes.any]),
  openByDefault: PropTypes.bool,
};

CohortPanel.defaultProps = {
  mainCohort: null,
  modules: null,
  certificate: null,
  openByDefault: false,
  tasks: [],
};

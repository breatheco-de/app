import { useState, useEffect } from 'react';
import {
  Box, Button,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { intervalToDuration } from 'date-fns';
import ModalToCloneProject from './ModalToCloneProject';
import useStyle from '../../common/hooks/useStyle';
import ReactPlayerV2 from '../../common/components/ReactPlayerV2';
import KPI from '../../common/components/KPI';
import Heading from '../../common/components/Heading';
import Text from '../../common/components/Text';
import Icon from '../../common/components/Icon';
import { intervalToHours } from '../../utils';
import { reportDatalayer } from '../../utils/requests';
// import modifyEnv from '../../../modifyEnv';
// import useCohortHandler from '../../common/hooks/useCohortHandler';
// import NextChakraLink from '../../common/components/NextChakraLink';

function ExerciseGuidedExperience({ currentTask, currentAsset }) {
  const { t } = useTranslation('syllabus');
  const { colorMode } = useStyle();
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [telemetryReport, setTelemetryReport] = useState([]);
  // const { state } = useCohortHandler();
  // const { cohortSession } = state;
  // const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });

  const isExerciseStated = !!currentTask?.assignment_telemetry;

  useEffect(() => {
    if (isExerciseStated) {
      const { steps, workout_session: workoutSession, last_interaction_at: lastInteractionAt } = currentTask.assignment_telemetry;
      const completedSteps = steps.reduce((acum, elem) => {
        if (elem.completed_at) return acum + 1;
        return acum;
      }, 0);

      const compilations = [];
      const tests = [];
      let successfulCompilations = 0;
      let successfulTests = 0;
      let errors = 0;

      steps.forEach((step) => {
        compilations.push(...step.compilations);
        tests.push(...step.tests);
      });

      compilations.forEach((comp) => {
        if (comp > 0) errors += 1;
        else successfulCompilations += 1;
      });

      tests.forEach((comp) => {
        if (comp > 0) errors += 1;
        else successfulTests += 1;
      });

      const completionPercentage = (completedSteps * 100) / steps.length;
      const roundedPercentage = Math.round((completionPercentage + Number.EPSILON) * 100) / 100;

      const totalHours = workoutSession.reduce((acum, elem) => {
        const startedAt = elem.started_at;
        const endedAt = elem.ended_at || lastInteractionAt;

        const duration = intervalToDuration({
          start: new Date(startedAt),
          end: new Date(endedAt),
        });

        const hours = intervalToHours(duration);

        return acum + hours;
      }, 0);

      const roundedHours = Math.round((totalHours + Number.EPSILON) * 100) / 100;
      setTelemetryReport([{
        label: t('completion-percentage'),
        icon: 'graph-up',
        value: `${roundedPercentage}%`,
      }, {
        label: t('total-steps'),
        icon: 'list',
        value: `${completedSteps}/${steps.length}`,
      }, {
        label: t('total-time'),
        icon: 'clock',
        value: `${roundedHours} hs`,
      }, {
        label: t('successful-compiles'),
        icon: 'documentVerified',
        value: successfulCompilations,
      }, {
        label: t('successful-tests'),
        icon: 'sync-success',
        value: successfulTests,
      }, {
        label: t('total-errors'),
        icon: 'sync-error',
        value: errors,
      }]);
    }
  }, [currentTask]);

  // const token = localStorage.getItem('accessToken');
  // const newWorkspace = `${BREATHECODE_HOST}/v1/provisioning/me/container/new?token=${token}&cohort=${cohortSession?.id}&repo=${currentAsset?.url}`;
  // const continueWorkSpace = `${BREATHECODE_HOST}/v1/provisioning/me/workspaces?token=${token}&cohort=${cohortSession?.id}&repo=${currentAsset?.url}`;

  return (
    <Box className={`horizontal-sroll ${colorMode}`} overflowY="auto" borderRadius="11px" background="blue.1000" height="80vh" mb="30px" padding="16px" display="flex" flexDirection="column" justifyContent="space-between" gap="20px">
      <Box display="flex" gap="16px" flexDirection={{ base: 'column', md: 'row' }}>
        <Box gap="16px" width="100%" display="flex" flexDirection={{ base: 'column', md: isExerciseStated ? 'column' : 'row' }} justifyContent="space-between">
          <Box maxWidth={{ base: 'none', md: isExerciseStated ? 'none' : '40%' }}>
            <Heading color="white" mb="16px" size="l" fontWeight="400">
              {currentAsset?.title}
            </Heading>
            <Text color="white" size="l">
              {currentAsset?.description}
            </Text>
          </Box>
          <Box width="100%" maxWidth={{ base: 'none', md: isExerciseStated ? 'none' : '50%' }} borderRadius="11px" overflow="hidden">
            <ReactPlayerV2
              withThumbnail
              controls={false}
              thumbnailStyle={{
                width: '100%',
                borderRadius: '11px',
              }}
              url={currentAsset?.intro_video_url}
            />
          </Box>
        </Box>
        {isExerciseStated && (
          <Box
            width="100%"
            height="fit-content"
            display="flex"
            flexWrap="wrap"
            gap="16px"
          >
            {telemetryReport.map((elem) => (
              <KPI
                label={elem.label}
                icon={elem.icon}
                value={elem.value}
                variationColor="#3A3A3A"
                background="blue.1200"
                border="none"
                height="160px"
                width={{ base: '100%', md: 'calc(50% - 8px)' }}
                textProps={{ textTransform: 'none', color: 'gray.dark' }}
              />
            ))}
          </Box>
        )}
      </Box>
      <Box background="blue.1100" borderRadius="11px" padding="16px">
        <Box display="flex" gap="16px">
          <Icon icon="learnpack" width="102px" height="102px" />
          <Box>
            <Heading size="xsm" mb="15px" color="white">
              {t('common:learnpack.title')}
            </Heading>
            <Text
              size="l"
              color="white"
              dangerouslySetInnerHTML={{ __html: t('common:learnpack.description', { projectName: currentTask?.title }) }}
            />
          </Box>
        </Box>
        <Box mt="16px" display="flex" gap="16px" flexDirection={{ base: 'column', md: 'row' }}>
          {/*
          <NextChakraLink
            target="__blank"
            href={isExerciseStated ? continueWorkSpace : newWorkspace}
            borderRadius="3px"
            background="white"
            color="blue.1000"
            padding="7px 16px !important"
            display="flex"
            gap="16px"
            alignItems="center"
            textDecoration="none"
            _hover={{ opacity: 0.7 }}
            fontSize="17px"
          >
            <Icon icon="prov-bridge" width="20px" height="20px" />
            {t('common:learnpack.open-in-learnpack-button.text')}
          </NextChakraLink>
          */}
          <Button
            variant="outline"
            borderColor="white"
            color="white"
            whiteSpace="normal"
            onClick={() => {
              reportDatalayer({
                dataLayer: {
                  event: 'open_learnpack_locally',
                  asset_slug: currentAsset?.slug,
                },
              });
              setShowCloneModal(true);
            }}
            fontSize="17px"
          >
            {t('common:learnpack.open-locally')}
          </Button>
        </Box>
      </Box>
      <ModalToCloneProject currentAsset={currentAsset} isOpen={showCloneModal} onClose={setShowCloneModal} />
    </Box>
  );
}

ExerciseGuidedExperience.propTypes = {
  currentTask: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  currentAsset: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};

ExerciseGuidedExperience.defaultProps = {
  currentTask: null,
  currentAsset: null,
};

export default ExerciseGuidedExperience;

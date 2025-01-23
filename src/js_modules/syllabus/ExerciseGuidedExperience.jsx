import { useState, useEffect } from 'react';
import { Box, Button } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { intervalToDuration } from 'date-fns';
import { intervalToHours, getBrowserInfo } from '../../utils';
import ProjectInstructions from './ProjectInstructions';
import useStyle from '../../common/hooks/useStyle';
import ReactPlayerV2 from '../../common/components/ReactPlayerV2';
import KPI from '../../common/components/KPI';
import Heading from '../../common/components/Heading';
import Text from '../../common/components/Text';
import { reportDatalayer } from '../../utils/requests';

function ExerciseGuidedExperience({ currentTask, currentAsset, handleStartLearnpack, iframeURL, learnpackStart, setLearnpackStart }) {
  const { t } = useTranslation('syllabus');
  const { colorMode } = useStyle();
  const [telemetryReport, setTelemetryReport] = useState([]);

  const isExerciseStarted = !!currentTask?.assignment_telemetry;

  useEffect(() => {
    if (isExerciseStarted) {
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
        const endedAt = elem.ended_at || lastInteractionAt || elem.started_at;

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

  reportDatalayer({
    dataLayer: {
      event: 'open_learnpack_instructions',
      asset_slug: currentAsset?.slug,
      agent: getBrowserInfo(),
    },
  });

  return (
    <Box className={`horizontal-sroll ${colorMode}`} overflowY="auto" borderRadius="11px" background="blue.1000" height="83vh" mb="30px" padding={learnpackStart ? '0' : '16px'} display="flex" flexDirection="column" justifyContent="space-between" gap={learnpackStart ? '0px' : '20px'}>
      {learnpackStart
        ? (
          <>
            <Button color="white" alignSelf="end" _hover="none" _active="none" background="none" onClick={() => setLearnpackStart(false)}>{t('close-exercise')}</Button>
            <Box flexGrow={100}>
              <iframe
                title="exercise-frame"
                key={iframeURL}
                src={iframeURL}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                scrolling="no"
              />
            </Box>
          </>
        )
        : (
          <>
            <Box display="flex" gap="16px" flexDirection={{ base: 'column', md: 'row' }} flexGrow={100}>
              <Box gap="16px" width="100%" display="flex" flexDirection={{ base: 'column', md: isExerciseStarted ? 'column' : 'row' }} justifyContent="space-between">
                <Box maxWidth={{ base: 'none', md: isExerciseStarted ? 'none' : '40%' }}>
                  <Heading color="white" mb="16px" size="l" fontWeight="400">
                    {currentAsset?.title}
                  </Heading>
                  <Text color="white" size="l">
                    {currentAsset?.description}
                  </Text>
                </Box>
                <Box width="100%" maxWidth={{ base: 'none', md: isExerciseStarted ? 'none' : '50%' }} borderRadius="11px" overflow="hidden">
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
              {isExerciseStarted && (
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
            <ProjectInstructions currentAsset={currentAsset} handleStartLearnpack={handleStartLearnpack} isStarted={isExerciseStarted} />
          </>
        )}
    </Box>
  );
}

ExerciseGuidedExperience.propTypes = {
  currentTask: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  currentAsset: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  iframeURL: PropTypes.string,
  handleStartLearnpack: PropTypes.func,
  setLearnpackStart: PropTypes.func,
  learnpackStart: PropTypes.bool,
};

ExerciseGuidedExperience.defaultProps = {
  currentTask: null,
  currentAsset: null,
  iframeURL: null,
  handleStartLearnpack: null,
  setLearnpackStart: null,
  learnpackStart: false,
};

export default ExerciseGuidedExperience;

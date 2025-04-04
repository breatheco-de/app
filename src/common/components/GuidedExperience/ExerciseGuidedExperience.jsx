import { useState, useEffect } from 'react';
import { Box, Button, Flex } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { intervalToDuration } from 'date-fns';
import { intervalToHours, getBrowserInfo } from '../../../utils';
import ProjectInstructions from './ProjectInstructions';
import useStyle from '../../hooks/useStyle';
import ReactPlayerV2 from '../ReactPlayerV2';
import KPI from '../KPI';
import Heading from '../Heading';
import Text from '../Text';
import { reportDatalayer } from '../../../utils/requests';

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

      let minutes;
      if (roundedHours < 1) minutes = Math.floor(Math.round(((totalHours * 60) + Number.EPSILON) * 100) / 100);
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
        value: minutes ? `${minutes} min` : `${roundedHours} hs`,
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
    <Box
      className={`horizontal-sroll ${colorMode}`}
      overflowY="auto"
      borderRadius="11px"
      background="blue.1000"
      height="83vh"
      padding={learnpackStart ? '0' : '16px'}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      gap={learnpackStart ? '0px' : '20px'}
    >
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
            <Box
              display="flex"
              gap="16px"
              flexDirection={{ base: 'column', md: 'row' }}
              flexGrow={10}
            >
              <Box
                display="flex"
                flexDirection={{ base: 'column', md: isExerciseStarted ? 'column' : 'row' }}
                width="100%"
                height="100%"
                gap={!isExerciseStarted && '10px'}
              >
                <Flex flexDirection="column" overflowY="hidden" maxWidth={{ base: 'none', md: !isExerciseStarted && '50%' }}>
                  <Heading color="white" mb="16px" size="l" fontWeight="400">
                    {currentAsset?.title}
                  </Heading>
                  <Box
                    className={`horizontal-sroll ${colorMode}`}
                    overflowY="auto"
                    flexGrow={1}
                    paddingRight={isExerciseStarted && '8px'}
                    maxHeight={isExerciseStarted && '70px'}
                  >
                    <Text color="white" size="l">
                      {currentAsset?.description}
                    </Text>
                  </Box>
                </Flex>
                <Flex justifyContent="center" flexGrow={1}>
                  <Box
                    flexGrow={isExerciseStarted && 1}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    width="100%"
                    height={isExerciseStarted && '100%'}
                    overflow="hidden"
                    borderRadius="10px"
                  >
                    <Box
                      borderRadius="10px"
                      width={{ base: '100%', md: 'auto' }}
                      maxWidth="100%"
                      aspectRatio="16 / 9"
                      height="100%"
                    >
                      <ReactPlayerV2
                        withThumbnail
                        controls={false}
                        width="100%"
                        height="100%"
                        style={{ objectFit: 'contain' }}
                        url={currentAsset?.intro_video_url}
                      />
                    </Box>
                  </Box>
                </Flex>
              </Box>

              {isExerciseStarted && (
                <Box
                  width="100%"
                  display="flex"
                  flexWrap="wrap"
                  gap="16px"
                >
                  {telemetryReport.map((elem) => (
                    <KPI
                      label={elem.label}
                      icon={elem.icon}
                      value={elem.value}
                      fontSize={{ base: '17px', sm: '25px', lg: '30px' }}
                      variationColor="#3A3A3A"
                      background="blue.1200"
                      border="none"
                      width={{ base: '100%', md: 'calc(50% - 8px)' }}
                      textProps={{ textTransform: 'none', color: 'gray.dark' }}
                    />
                  ))}
                </Box>
              )}
            </Box>

            <ProjectInstructions
              currentAsset={currentAsset}
              handleStartLearnpack={handleStartLearnpack}
              isStarted={isExerciseStarted}
              flexGrow="1"
              display="flex"
              flexDirection="column"
              justifyContent="center"
            />
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

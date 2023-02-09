/* eslint-disable no-unused-vars */
import React, { Fragment, useEffect } from 'react';
import {
  AvatarGroup,
  Box, Button,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import axios from '../../axios';
import Icon from '../../common/components/Icon';
import Text from '../../common/components/Text';
import { usePersistent } from '../../common/hooks/usePersistent';
import useStyle from '../../common/hooks/useStyle';
import Heading from '../../common/components/Heading';
import handlers from '../../common/handlers';
import Progress from '../../common/components/ProgressBar/Progress';
import Counter from '../../common/components/ProgressCircle/Counter';
import useProgramList from '../../common/store/actions/programListAction';
import AvatarUser from '../cohortSidebar/avatarUser';

function CohortProgram({ item, handleChoose, usersConnected }) {
  const { t } = useTranslation('choose-program');
  const { programsList } = useProgramList();
  const [cohortSession, setCohortSession] = usePersistent('cohortSession', {});
  const { borderColorStrong, hexColor, backgroundColor3 } = useStyle();
  const commonColor = useColorModeValue('gray.600', 'gray.300');
  const router = useRouter();

  const { cohort } = item;
  const currentCohortProps = programsList[cohort.slug];

  const hasStartedCourse = currentCohortProps?.allTasks?.length > 0 && currentCohortProps?.allTasks?.some((task) => task?.completed > 0);
  const { version, slug, name } = cohort.syllabus_version;

  const isHiddenOnPrework = cohort?.is_hidden_on_prework === null ? cohort?.academy?.is_hidden_on_prework : cohort?.is_hidden_on_prework;

  const onClickHandler = () => {
    handleChoose({
      version,
      slug,
      cohort_name: cohort.name,
      cohort_slug: cohort?.slug,
      syllabus_name: name,
      academy_id: cohort.academy.id,
    });

    axios.defaults.headers.common.Academy = cohort.academy.id;
    setCohortSession({
      ...cohort,
      ...cohortSession,
      selectedProgramSlug: `/cohort/${cohort?.slug}/${slug}/v${version}`,
    });
    router.push(`/cohort/${cohort?.slug}/${slug}/v${version}`);
  };

  const taskIcons = {
    LESSON: 'book',
    EXERCISE: 'strength',
    PROJECT: 'code',
    QUIZ: 'answer',
  };

  const singleTeacher = currentCohortProps?.teacher?.length > 0 && currentCohortProps?.teacher[0];
  const teacherfullName = `${singleTeacher?.user?.first_name} ${singleTeacher?.user?.last_name}`;

  const showHasStartedCourseButton = hasStartedCourse ? (
    <Button variant="link" onClick={onClickHandler} gridGap="6px" fontWeight={700}>
      {t('program-list.continue-course')}
      <Icon icon="longArrowRight" width="18px" height="18px" color={hexColor.blueDefault} />
    </Button>
  ) : (
    <Button variant="default" onClick={onClickHandler}>
      {t('program-list.start-course')}
    </Button>
  );

  // const formatToLocale = (date) => {
  //   new Date(date)
  //     .toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
  // };
  // const formatedTime = handlers.formatTimeString(new Date(cohort.kickoff_date)).duration;
  // const hasStarted = handlers.checkIfExpired(new Date(cohort.kickoff_date));
  // const hasExpired = handlers.checkIfExpired({ date: new Date(cohort.ending_date) });

  return (
    <Box borderRadius="9px" border="1px solid" borderColor={borderColorStrong} height="fit-content" minHeight="150px" position="relative" padding="0 14px">
      <Box padding="12px 12px" backgroundColor="blue.default" borderRadius="50%" position=" absolute" top={-6} left={4}>
        <Icon icon="coding" width="24px" height="24px" style={{ margin: 'auto 0' }} />
      </Box>

      {/* <Box display="flex" justifyContent="flex-end">
        {!hasExpired.value && (
          <>
            Expires in:
            <br />
            {hasExpired.date}

          </>
        )}
      </Box> */}
      <Box margin="2rem 0 14px 0">
        <Heading size="16px" padding="10px 0">
          {cohort.name}
        </Heading>

        {!(isHiddenOnPrework && cohort.stage.includes('PREWORK')) && (
          <Box display="flex" gridGap="10px" margin="0 0 20px 0" background={backgroundColor3} padding="12px 12px" borderRadius="6px">
            <Box display="flex" flexDirection="column" flex={0.5} gridGap="4px">
              {currentCohortProps?.allTasks?.map((task) => task.taskLength > 0 && (
                <Box key={`${task.id}-${task.title}`} display="flex" gridGap="10px" alignItems="center">
                  <Icon icon={taskIcons[task.task_type]} width="16px" height="16px" color={hexColor.blueDefault} />
                  <Box display="flex" gridGap="5px" fontWeight={700}>
                    <Text size="sm">
                      {task?.completed ? `${task.completed}/${task.taskLength}` : task.taskLength}
                    </Text>
                    <Text size="sm">
                      {t(`common:${task?.task_type?.toLowerCase()}`)}
                    </Text>
                  </Box>
                </Box>
              ))}
            </Box>
            {(currentCohortProps?.assistant?.length > 0 || currentCohortProps?.teacher?.length > 0) && (
              <Box flex={0.5}>
                <Box>
                  <Text size="sm" fontWeight={700}>
                    {t('program-list.mentors-available', { count: currentCohortProps?.assistant?.length + currentCohortProps?.teacher?.length })}
                  </Text>
                  <Box display="flex" justifyContent="space-between" mt="10px">
                    {!!singleTeacher && (
                      <AvatarUser
                        width="42px"
                        height="42px"
                        key={`${singleTeacher.id} - ${singleTeacher.user.first_name}`}
                        fullName={teacherfullName}
                        data={singleTeacher}
                        isOnline={usersConnected?.includes(singleTeacher.user.id)}
                        badge
                        customBadge={(
                          <Box position="absolute" bottom="-6px" right="-8px" background="blue.default" borderRadius="50px" p="5px" border="2px solid white">
                            <Icon icon="teacher1" width="12px" height="12px" color="#FFFFFF" />
                          </Box>
                        )}
                      />
                    )}
                    <AvatarGroup max={2} size="md">
                      {currentCohortProps?.assistant?.map((c, i) => {
                        const fullName = `${c.user.first_name} ${c.user.last_name}`;
                        const isOnline = usersConnected?.includes(c.user.id);
                        return (
                          <Fragment key={`${c.id} - ${c.user.first_name}`}>
                            <AvatarUser
                              width="42px"
                              height="42px"
                              index={i}
                              // key={`${c.id} - ${c.user.first_name}`}
                              isWrapped
                              fullName={fullName}
                              data={c}
                              isOnline={isOnline}
                              badge
                            />
                          </Fragment>
                        );
                      })}
                    </AvatarGroup>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        )}
        {hasStartedCourse && (
          <Box display="flex" flexDirection="column" gridGap="6px">
            <Progress percents={currentCohortProps?.percentage || 0} duration={0.6} barHeight="10px" borderRadius="20px" />
            <Text size="xs" color="blue.default">
              <Counter valueTo={currentCohortProps?.percentage || 0} totalDuration={1} />
              %
            </Text>
          </Box>
        )}

        <Box width="100%" display="flex" justifyContent="center">
          {!(isHiddenOnPrework && cohort.stage.includes('PREWORK')) ? showHasStartedCourseButton
            : (
              <Text
                size="12px"
                color={commonColor}
              >
                You will have access to this cohort as soon as it starts!
              </Text>
            )}
        </Box>
      </Box>
    </Box>
  );
}

CohortProgram.propTypes = {
  item: PropTypes.objectOf(PropTypes.any),
  handleChoose: PropTypes.func,
  usersConnected: PropTypes.arrayOf(PropTypes.any),
};
CohortProgram.defaultProps = {
  item: {},
  handleChoose: () => {},
  usersConnected: [],
};

export default CohortProgram;

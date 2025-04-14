import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { subMinutes } from 'date-fns';
import { memo, useState } from 'react';
import handlers from '../../handlers';
import ProgramCard from '../ProgramCard';
import useCohortHandler from '../../hooks/useCohortHandler';
import useSubscriptionsHandler from '../../store/actions/subscriptionAction';
import axios from '../../axios';
import useProgramList from '../../store/actions/programListAction';

function Program({ cohort, onOpenModal, setLateModalProps }) {
  const { setCohortSession, cohortsAssignments } = useCohortHandler();
  const { state } = useSubscriptionsHandler();
  const { isLoading } = state;
  const [isLoadingPageContent, setIsLoadingPageContent] = useState(false);
  const { state: programsList } = useProgramList();
  const signInDate = cohort.cohort_user.created_at;
  const currentCohort = programsList?.[cohort.slug];
  const tasks = cohortsAssignments[cohort.slug]?.tasks;
  const syllabus = cohortsAssignments[cohort.slug]?.syllabus;
  const assignmentsData = handlers.getAssignmentsCount({ data: syllabus, taskTodo: tasks });

  const isAvailableAsSaas = cohort.cohort_user?.role === 'TEACHER' ? false : cohort.available_as_saas;

  const subscription = isAvailableAsSaas && (currentCohort?.plan_financing || currentCohort?.subscription);

  const isBought = subscription?.invoices?.[0]?.amount >= 0;
  const availableAsSaasButNotBought = isAvailableAsSaas && !isBought;
  const isFreeTrial = subscription?.status === 'FREE_TRIAL' || availableAsSaasButNotBought;
  const isFinantialStatusLate = cohort.cohort_user.finantial_status === 'LATE' || cohort.cohort_user.educational_status === 'SUSPENDED';

  const router = useRouter();

  const isHiddenOnPrework = cohort?.is_hidden_on_prework;

  const onClickHandler = () => {
    setIsLoadingPageContent(true);

    if (isFinantialStatusLate) {
      setLateModalProps({
        isOpen: true,
        data: [{ cohort }],
      });
      setIsLoadingPageContent(false);
    } else {
      axios.defaults.headers.common.Academy = cohort.academy.id;

      setCohortSession(cohort);
      router.push(cohort.selectedProgramSlug);
    }
  };

  const syllabusContent = assignmentsData?.assignmentsProgress?.length > 0 ? assignmentsData?.assignmentsProgress.map((task) => {
    if (task?.taskType === 'LESSON') {
      return {
        totalLessons: task?.total,
        completedLessons: task?.completed,
      };
    }
    if (task?.taskType === 'EXERCISE') {
      return {
        totalExercises: task?.total,
        completedExercises: task?.completed,
      };
    }
    if (task?.taskType === 'PROJECT') {
      return {
        totalProjects: task?.total,
        completedProjects: task?.completed,
      };
    }
    if (task?.taskType === 'QUIZ') {
      return {
        totalQuizzes: task?.total,
        completedQuizzes: task?.completed,
      };
    }
    return ({});
  }) : [];

  return (
    <ProgramCard
      width="100%"
      syllabusContent={syllabusContent?.length > 0 ? Object.assign({}, ...syllabusContent) : {}}
      programName={cohort.name}
      isFinantialStatusLate={isFinantialStatusLate}
      isBought={isBought || availableAsSaasButNotBought}
      isFreeTrial={isFreeTrial}
      freeTrialExpireDate={subscription?.valid_until ? new Date(subscription?.valid_until) : new Date(subMinutes(new Date(), 1))}
      isAvailableAsSaas={isAvailableAsSaas}
      iconLink={cohort.syllabus_version?.logo}
      isLoadingPageContent={isLoadingPageContent}
      isLoading={currentCohort === undefined || isLoading}
      startsIn={cohort.kickoff_date}
      endsAt={cohort.ending_date}
      signInDate={signInDate}
      icon="coding"
      subscription={subscription || {}}
      subscriptionStatus={subscription?.status}
      iconBackground="blue.default"
      assistants={currentCohort?.assistant}
      teacher={currentCohort?.teacher?.[0]}
      courseProgress={assignmentsData?.percentage || 0}
      handleChoose={onClickHandler}
      isHiddenOnPrework={isHiddenOnPrework && cohort.stage.includes('PREWORK')}
      onOpenModal={onOpenModal}
    />
  );
}

Program.propTypes = {
  cohort: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  onOpenModal: PropTypes.func,
  setLateModalProps: PropTypes.func,
};

Program.defaultProps = {
  cohort: {},
  onOpenModal: () => {},
  setLateModalProps: () => {},
};

export default memo(Program);

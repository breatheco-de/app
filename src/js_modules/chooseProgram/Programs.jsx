/* eslint-disable camelcase */
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { subMinutes } from 'date-fns';
import { memo, useState } from 'react';
import ProgramCard from '../../common/components/ProgramCard';
import useCohortHandler from '../../common/hooks/useCohortHandler';
import useSubscriptionsHandler from '../../common/store/actions/subscriptionAction';
import axios from '../../axios';
import useProgramList from '../../common/store/actions/programListAction';

function Programs({ item, onOpenModal, setLateModalProps }) {
  const { setCohortSession } = useCohortHandler();
  const { state } = useSubscriptionsHandler();
  const { isLoading } = state;
  const [isLoadingPageContent, setIsLoadingPageContent] = useState(false);
  const { programsList } = useProgramList();
  const { cohort_user: cohortUser, ...cohort } = item;
  const signInDate = item.created_at;
  const { version, slug } = cohort.syllabus_version;
  const currentCohortProps = programsList[cohort.slug];

  const subscription = (cohort?.available_as_saas && currentCohortProps?.plan_financing) || (cohort?.available_as_saas && currentCohortProps?.subscription);

  const isBought = subscription?.invoices?.[0]?.amount >= 0;
  const availableAsSaasButNotBought = cohort?.available_as_saas && !isBought;
  const isFreeTrial = subscription?.status === 'FREE_TRIAL' || availableAsSaasButNotBought;
  const isFinantialStatusLate = item?.finantial_status === 'LATE' || item?.educational_status === 'SUSPENDED';

  const router = useRouter();

  const isHiddenOnPrework = cohort?.is_hidden_on_prework === null ? cohort?.academy?.is_hidden_on_prework : cohort?.is_hidden_on_prework;

  const onClickUpgrade = () => {
    onOpenModal();
  };
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
      setCohortSession({
        ...cohort,
        cohort_user: cohortUser,
        selectedProgramSlug: `/cohort/${cohort?.slug}/${slug}/v${version}`,
      });
      router.push(`/cohort/${cohort?.slug}/${slug}/v${version}`);
    }
  };

  // const availableAsSaasButNotBought = cohort?.available_as_saas && !isBought;

  const syllabusContent = currentCohortProps?.allTasks?.length > 0 ? currentCohortProps?.allTasks.map((task) => {
    if (task?.task_type === 'LESSON') {
      return {
        totalLessons: task?.taskLength,
        completedLessons: task?.completed,
      };
    }
    if (task?.task_type === 'EXERCISE') {
      return {
        totalExercises: task?.taskLength,
        completedExercises: task?.completed,
      };
    }
    if (task?.task_type === 'PROJECT') {
      return {
        totalProjects: task?.taskLength,
        completedProjects: task?.completed,
      };
    }
    if (task?.task_type === 'QUIZ') {
      return {
        totalQuizzes: task?.taskLength,
        completedQuizzes: task?.completed,
      };
    }
    return ({});
  }) : [];

  return (
    <ProgramCard
      width="100%"
      syllabusContent={syllabusContent?.length > 0 ? Object.assign({}, ...syllabusContent) : {}}
      programName={cohort?.name}
      isFinantialStatusLate={isFinantialStatusLate}
      isBought={isBought || availableAsSaasButNotBought}
      isFreeTrial={isFreeTrial}
      freeTrialExpireDate={subscription?.valid_until ? new Date(subscription?.valid_until) : new Date(subMinutes(new Date(), 1))}
      isAvailableAsSaas={cohort?.available_as_saas}
      iconLink={cohort?.syllabus_version?.logo}
      // haveFreeTrial={}
      // isBought={moduleStarted}
      // isBought={!isFreeTrial}
      isLoadingPageContent={isLoadingPageContent}
      isLoading={currentCohortProps === undefined || isLoading}
      startsIn={item?.kickoff_date}
      endsAt={item?.ending_date}
      signInDate={signInDate}
      icon="coding"
      subscription={subscription || {}}
      subscriptionStatus={subscription?.status}
      iconBackground="blue.default"
      assistants={currentCohortProps?.assistant}
      teacher={currentCohortProps?.teacher?.[0]}
      courseProgress={currentCohortProps?.percentage || 0}
      handleChoose={onClickHandler}
      isHiddenOnPrework={isHiddenOnPrework && cohort.stage.includes('PREWORK')}
      onOpenModal={onClickUpgrade}
    />
  );
}

Programs.propTypes = {
  item: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  onOpenModal: PropTypes.func,
  setLateModalProps: PropTypes.func,
};

Programs.defaultProps = {
  item: {},
  onOpenModal: () => {},
  setLateModalProps: () => {},
};

export default memo(Programs);

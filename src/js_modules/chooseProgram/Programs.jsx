import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { subMinutes } from 'date-fns';
import { memo, useState } from 'react';
import ProgramCard from '../../common/components/ProgramCard';
import { usePersistent } from '../../common/hooks/usePersistent';
import axios from '../../axios';
import useProgramList from '../../common/store/actions/programListAction';

function Programs({ item, handleChoose, onOpenModal }) {
  const [cohortSession, setCohortSession] = usePersistent('cohortSession', {});
  const [isLoadingPageContent, setIsLoadingPageContent] = useState(false);
  const { programsList } = useProgramList();
  const { cohort } = item;
  const signInDate = item.created_at;
  const { version, slug, name } = cohort.syllabus_version;
  const currentCohortProps = programsList[cohort.slug];

  const subscription = (cohort?.available_as_saas && currentCohortProps?.subscription) || (cohort?.available_as_saas && currentCohortProps?.plan_financing);

  const isBought = subscription?.invoices?.[0]?.amount >= 0;
  const availableAsSaasButNotBought = cohort?.available_as_saas && !isBought;
  const isFreeTrial = subscription?.status === 'FREE_TRIAL' || availableAsSaasButNotBought;
  const subscriptionExists = currentCohortProps?.subscription !== null || currentCohortProps?.plan_financing !== null;

  const router = useRouter();

  const isHiddenOnPrework = cohort?.is_hidden_on_prework === null ? cohort?.academy?.is_hidden_on_prework : cohort?.is_hidden_on_prework;

  const onClickUpgrade = () => {
    onOpenModal();
  };
  const onClickHandler = () => {
    setIsLoadingPageContent(true);
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

  return ((cohort?.available_as_saas && subscriptionExists) || cohort?.available_as_saas === false) && (
    <ProgramCard
      width="100%"
      syllabusContent={syllabusContent?.length > 0 ? Object.assign({}, ...syllabusContent) : {}}
      programName={cohort?.name}
      isBought={isBought || availableAsSaasButNotBought}
      isFreeTrial={isFreeTrial}
      freeTrialExpireDate={subscription?.valid_until ? new Date(subscription?.valid_until) : new Date(subMinutes(new Date(), 1))}
      isAvailableAsSaas={cohort?.available_as_saas}
      // haveFreeTrial={}
      // isBought={moduleStarted}
      // isBought={!isFreeTrial}
      isLoadingPageContent={isLoadingPageContent}
      isLoading={currentCohortProps === undefined}
      startsIn={item?.cohort?.kickoff_date}
      endsAt={item?.cohort?.ending_date}
      signInDate={signInDate}
      icon="coding"
      subscription={subscription}
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
  handleChoose: PropTypes.func,
  onOpenModal: PropTypes.func,
};

Programs.defaultProps = {
  item: {},
  handleChoose: () => {},
  onOpenModal: () => {},
};

export default memo(Programs);

import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import ProgramCard from '../../common/components/ProgramCard';
import { usePersistent } from '../../common/hooks/usePersistent';
import axios from '../../axios';
import useProgramList from '../../common/store/actions/programListAction';

const Programs = ({ item, handleChoose, usersConnected }) => {
  const [cohortSession, setCohortSession] = usePersistent('cohortSession', {});
  const { programsList } = useProgramList();
  const { cohort } = item;
  const { version, slug, name } = cohort.syllabus_version;
  const currentCohortProps = programsList[cohort.slug];
  const moduleStarted = currentCohortProps?.allTasks?.some((task) => task?.completed && task?.completed > 0);

  const router = useRouter();

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

  const syllabusContent = currentCohortProps?.allTasks.map((task) => {
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
  });

  return (
    <ProgramCard
      width="100%"
      syllabusContent={syllabusContent?.length > 0 ? Object.assign({}, ...syllabusContent) : {}}
      programName={cohort?.name}
      isBought={moduleStarted}
      startsIn={item?.cohort?.kickoff_date}
      icon="coding"
      iconBackground="blue.default"
      assistants={currentCohortProps?.assistant}
      teacher={currentCohortProps?.teacher?.[0]}
      freeTrialExpireDate={new Date()}
      usersConnected={usersConnected}
      courseProgress={currentCohortProps?.percentage || 0}
      handleChoose={onClickHandler}
      isHiddenOnPrework={isHiddenOnPrework && cohort.stage.includes('PREWORK')}
    />
  );
};

Programs.propTypes = {
  item: PropTypes.objectOf(PropTypes.any),
  handleChoose: PropTypes.func,
  usersConnected: PropTypes.arrayOf(PropTypes.any),
};

Programs.defaultProps = {
  item: {},
  handleChoose: () => {},
  usersConnected: [],
};

export default Programs;

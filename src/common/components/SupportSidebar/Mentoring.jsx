/* eslint-disable react/prop-types */
import {
  memo, useState, useEffect,
} from 'react';
import {
  Box,
  // useToast,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import bc from '../../services/breathecode';
import MentoringConsumables from './MentoringConsumables';
import useAuth from '../../hooks/useAuth';
import useCohortHandler from '../../hooks/useCohortHandler';

function Mentoring({
  width, allCohorts, allSyllabus, programServices, subscriptions, subscriptionData,
}) {
  const { t } = useTranslation('dashboard');
  const router = useRouter();
  const { isLoading, user } = useAuth();
  const { slug } = router.query;
  const { state } = useCohortHandler();
  const { cohortSession } = state;
  const [consumables, setConsumables] = useState([]);
  const [mentoryProps, setMentoryProps] = useState({});
  const [allMentorsAvailable, setAllMentorsAvailable] = useState([]);
  const [programMentors, setProgramMentors] = useState([]);
  const [cohortSessionIsSaaS, setCohortSessionIsSaaS] = useState(true);
  const [searchProps, setSearchProps] = useState({ serviceSearch: '', mentorSearch: '' });

  const filterServices = () => {
    if (subscriptionData?.selected_mentorship_service_set?.mentorship_services?.length > 0) {
      return subscriptionData?.selected_mentorship_service_set?.mentorship_services?.filter(
        (l) => l.name.toLowerCase().includes(searchProps.serviceSearch),
      );
    }
    if (programServices.list?.length > 0) {
      return programServices.list?.filter(
        (l) => l.name.toLowerCase().includes(searchProps.serviceSearch),
      );
    }

    return [];
  };
  const suscriptionServicesFiltered = filterServices();

  const mentorsFiltered = programMentors.filter(
    (mentor) => {
      const fullName = `${mentor?.user?.first_name} ${mentor?.user?.last_name}`.toLowerCase();
      return (
        fullName.includes(searchProps.mentorSearch)
        && mentor.services.some((sv) => sv.status === 'ACTIVE' && sv.slug === mentoryProps?.service?.slug)
      );
    },
  );

  const getAllMentorsAvailable = async () => {
    const servicesSlugs = programServices.list.map((service) => service?.slug);

    const academies = {};
    programServices.list.forEach((service) => {
      const { academy, ...restOfService } = service;
      if (!academies[academy.id]) {
        academies[academy.id] = { services: [] };
      }
      academies[academy.id].services.push(restOfService);
    });

    const academyData = Object.entries(academies).map(([academy, values]) => ({
      id: Number(academy),
      services: values.services,
    }));

    if (servicesSlugs.length > 0 || allSyllabus.length > 0) {
      const mentors = academyData.map((academy) => bc.mentorship({
        services: academy.services.map((s) => s.slug).join(','),
        status: 'ACTIVE',
        syllabus: allSyllabus?.join(',') || slug,
        academy: academy.id,
      }).getMentor()
        .then((res) => {
          const allMentors = res?.data;
          return allMentors;
        }));
      const mentorsList = (await Promise.all(mentors)).flat();
      return mentorsList;
    }

    return [];
  };

  const sortByConsumptionAvailability = (allConsumables) => allConsumables.sort((a, b) => {
    const balanceA = a?.balance?.unit;
    const balanceB = b?.balance?.unit;

    if (balanceA === -1 && balanceB !== -1) return -1;
    if (balanceA !== -1 && balanceB === -1) return 1;

    if (balanceA > 0 && balanceB <= 0) return -1;
    if (balanceA <= 0 && balanceB > 0) return 1;

    if (balanceA > 0 && balanceB > 0) return balanceB - balanceA;

    return 0;
  });

  const getMentorsAndConsumables = async () => {
    const mentors = await getAllMentorsAvailable();
    const reqConsumables = await bc.payment().service().consumable()
      .then((res) => res?.data?.mentorship_service_sets.map((mentorshipServiceSet) => bc.mentorship()
        .getServiceSet(mentorshipServiceSet?.id)
        .then((rs) => ({
          ...rs?.data,
          ...mentorshipServiceSet,
        }))));

    const allConsumables = await Promise.all(reqConsumables);
    const sortedConsumables = sortByConsumptionAvailability(allConsumables);
    setConsumables(sortedConsumables);
    setAllMentorsAvailable(mentors);
  };

  useEffect(() => {
    if (!programServices.isFetching && programServices.list?.length > 0) {
      getMentorsAndConsumables();
    }
  }, [programServices]);

  useEffect(() => {
    const existsCohortSession = typeof cohortSession?.available_as_saas === 'boolean';
    if (existsCohortSession) {
      setCohortSessionIsSaaS(cohortSession?.available_as_saas);
    }
  }, [allCohorts]);

  return !isLoading && user?.id && (
    <Box>
      <Box fontSize="16px" padding="6px 8px" color="black" background="yellow.light" textAlign="center" borderRadius="17px" fontWeight={700}>
        {t('supportSideBar.mentoring-label')}
      </Box>
      <MentoringConsumables
        {...{
          mentoryProps,
          width,
          consumables,
          setMentoryProps,
          programServices: programServices.list?.length > 0 ? programServices.list : subscriptionData?.selected_mentorship_service_set?.mentorship_services,
          servicesFiltered: suscriptionServicesFiltered,
          searchProps,
          setSearchProps,
          setProgramMentors,
          mentorsFiltered,
          allMentorsAvailable,
          subscriptionData,
          cohortSessionIsSaaS,
          allSubscriptions: subscriptions,
        }}
      />
    </Box>
  );
}

Mentoring.propTypes = {
  programServices: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any, PropTypes.object])).isRequired,
  width: PropTypes.string,
  subscriptionData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  subscriptions: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  allCohorts: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  allSyllabus: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
};

Mentoring.defaultProps = {
  width: '100%',
  subscriptions: [],
  allCohorts: [],
  allSyllabus: [],
};

export default memo(Mentoring);

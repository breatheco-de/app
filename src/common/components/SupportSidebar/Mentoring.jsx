/* eslint-disable react/prop-types */
import {
  memo, useState, useEffect,
} from 'react';
import {
  Box,
  // useToast,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import bc from '../../services/breathecode';
import MentoringFree from './MentoringFree';
import MentoringConsumables from './MentoringConsumables';
import useAuth from '../../hooks/useAuth';
import useCohortHandler from '../../hooks/useCohortHandler';

function Mentoring({
  width, allCohorts, allSyllabus, programServices, subscriptions, subscriptionData,
}) {
  const { t } = useTranslation('dashboard');
  const [savedChanges, setSavedChanges] = useState({});
  const { state } = useCohortHandler();
  const { cohortSession } = state;
  const router = useRouter();
  const [consumables, setConsumables] = useState({});
  const [mentoryProps, setMentoryProps] = useState({});
  const [allMentorsAvailable, setAllMentorsAvailable] = useState([]);
  const [programMentors, setProgramMentors] = useState([]);
  const [isAvailableForConsumables, setIsAvailableForConsumables] = useState(true);
  const { isLoading, user } = useAuth();
  // const toast = useToast();
  const { slug } = router.query;

  const [searchProps, setSearchProps] = useState({
    serviceSearch: '',
    mentorSearch: '',
  });

  const servicesFiltered = programServices.list.filter(
    (l) => l.name.toLowerCase().includes(searchProps.serviceSearch),
  );

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
      const fullName = `${mentor.user.first_name} ${mentor.user.last_name}`.toLowerCase();
      const mentorServices = fullName.includes(searchProps.mentorSearch) && mentor.services.some((sv) => sv.status === 'ACTIVE'
        && sv.slug === mentoryProps?.service?.slug);
      return mentorServices;
    },
  );

  const dateFormated = {
    en: mentoryProps?.date && format(new Date(mentoryProps.date), 'MMMM dd'),
    es: mentoryProps?.date && format(new Date(mentoryProps.date), "dd 'de' MMMM", { locale: es }),
  };

  const dateFormated2 = {
    en: mentoryProps?.date && format(new Date(mentoryProps.date), 'MMMM dd, yyyy'),
    es: mentoryProps?.date && format(new Date(mentoryProps.date), "dd 'de' MMMM, yyyy", { locale: es }),
  };

  useEffect(() => {
    if (mentoryProps?.time) {
      const [hours, minutes] = mentoryProps.time.split(':');

      const nDate = mentoryProps?.date
        && new Date(mentoryProps.date);

      nDate.setHours(+hours, +minutes, 0, 0); // set hours/minute;
      setMentoryProps({ ...mentoryProps, date: nDate });
      setSavedChanges({ ...mentoryProps, date: nDate });
    }
  }, [mentoryProps?.time]);

  const step1 = !mentoryProps?.service;
  const step2 = mentoryProps?.service && !mentoryProps?.date;

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

    // Convert the object to an array of academies with their services
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
    setConsumables(allConsumables);
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
      setIsAvailableForConsumables(cohortSession?.available_as_saas);
    }
    if (!existsCohortSession) {
      if (allCohorts.length > 0) {
        setIsAvailableForConsumables(allCohorts?.some((c) => c.cohort?.available_as_saas === true));
      }
    }
  }, [allCohorts]);

  const mentorshipService = consumables?.mentorship_service_sets?.find(
    (c) => c?.slug.toLowerCase() === subscriptionData?.selected_mentorship_service_set?.slug.toLowerCase(),
  );

  return !isLoading && user?.id && (
    <Box>
      <Box fontSize="16px" padding="6px 8px" color="black" background="yellow.light" textAlign="center" borderRadius="17px" fontWeight={700}>
        {t('supportSideBar.mentoring-label')}
      </Box>
      {isAvailableForConsumables ? (
        <MentoringConsumables
          {...{
            mentoryProps,
            width,
            consumables,
            mentorshipService,
            setMentoryProps,
            programServices: programServices.list?.length > 0 ? programServices.list : subscriptionData?.selected_mentorship_service_set?.mentorship_services,
            servicesFiltered: suscriptionServicesFiltered,
            dateFormated,
            searchProps,
            setSearchProps,
            setProgramMentors,
            savedChanges,
            setSavedChanges,
            mentorsFiltered,
            step1,
            step2,
            dateFormated2,
            allMentorsAvailable,
            subscriptionData,
            allSubscriptions: subscriptions,
          }}
        />
      ) : (
        <MentoringFree
          {...{
            mentoryProps,
            width,
            setMentoryProps,
            programServices: programServices.list,
            dateFormated,
            servicesFiltered,
            searchProps,
            setSearchProps,
            setProgramMentors,
            savedChanges,
            setSavedChanges,
            mentorsFiltered,
            step1,
            step2,
            dateFormated2,
            allMentorsAvailable,
          }}
        />
      )}
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

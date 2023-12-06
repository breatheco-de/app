/* eslint-disable react/prop-types */
import {
  memo, useState, useEffect,
} from 'react';
import {
  Box,
  useToast,
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
import { usePersistent } from '../../hooks/usePersistent';

function Mentoring({
  width, programServices, subscriptions, subscriptionData, flags,
}) {
  const { t } = useTranslation('dashboard');
  const [savedChanges, setSavedChanges] = useState({});
  const [cohortSession] = usePersistent('cohortSession', {});
  const router = useRouter();
  const [consumables, setConsumables] = useState({});
  const [mentoryProps, setMentoryProps] = useState({});
  const [allMentorsAvailable, setAllMentorsAvailable] = useState([]);
  const [programMentors, setProgramMentors] = useState([]);
  const { isLoading, user } = useAuth();
  const toast = useToast();
  const { slug } = router.query;

  const [searchProps, setSearchProps] = useState({
    serviceSearch: '',
    mentorSearch: '',
  });

  const servicesFiltered = programServices.filter(
    (l) => l.name.toLowerCase().includes(searchProps.serviceSearch),
  );
  const suscriptionServicesFiltered = subscriptionData?.selected_mentorship_service_set?.mentorship_services?.length > 0
    ? subscriptionData?.selected_mentorship_service_set?.mentorship_services?.filter(
      (l) => l.name.toLowerCase().includes(searchProps.serviceSearch),
    ) : [];

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

  const getAllMentorsAvailable = () => {
    const servicesSlugs = programServices.map((service) => service?.slug);

    if (servicesSlugs.length > 0) {
      return bc.mentorship({
        services: servicesSlugs.toString(),
        status: 'ACTIVE',
        syllabus: slug,
      }).getMentor()
        .then((res) => res?.data)
        .catch(() => {
          toast({
            position: 'top',
            title: 'Error',
            description: t('alert-message:error-finding-mentors'),
            status: 'error',
            duration: 7000,
            isClosable: true,
          });
        });
    }

    return [];
  };

  const getMentorsAndConsumables = async () => {
    const mentors = await getAllMentorsAvailable();
    const allConsumables = await bc.payment().service().consumable()
      .then((res) => res?.data);

    setConsumables(allConsumables);
    setAllMentorsAvailable(mentors);
    // setServiceMentoring(allConsumables);
    // setAllMentorsAvailable(mentors);
  };

  useEffect(() => {
    if (programServices?.length > 0) {
      getMentorsAndConsumables();
    }
  }, [programServices]);

  const isAvailableForConsumables = cohortSession?.available_as_saas === true;
  const mentorshipService = consumables?.mentorship_service_sets?.find(
    (c) => c?.slug.toLowerCase() === subscriptionData?.selected_mentorship_service_set?.slug.toLowerCase(),
  );

  return !isLoading && user?.id && (
    <Box>
      <Box fontSize="16px" padding="10px 16px" background="yellow.light" textAlign="center" borderRadius="17px" fontWeight={700}>
        {t('supportSideBar.mentoring-label')}
      </Box>
      {isAvailableForConsumables && flags?.appReleaseShowConsumedMentorships ? (
        <MentoringConsumables
          {...{
            mentoryProps,
            width,
            consumables,
            mentorshipService,
            setMentoryProps,
            programServices: subscriptionData?.selected_mentorship_service_set?.mentorship_services,
            dateFormated,
            servicesFiltered: suscriptionServicesFiltered,
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
            programServices,
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
  flags: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any, PropTypes.object])).isRequired,
  subscriptionData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  subscriptions: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
};

Mentoring.defaultProps = {
  width: '100%',
  subscriptions: [],
};

export default memo(Mentoring);

/* eslint-disable react/prop-types */
import {
  memo, useState, useEffect,
} from 'react';
import {
  toast,
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

const Mentoring = ({
  width, programServices, flags,
}) => {
  const { t } = useTranslation('dashboard');
  const [savedChanges, setSavedChanges] = useState({});
  const [cohortSession] = usePersistent('cohortSession', {});
  const router = useRouter();
  const [serviceMentoring, setServiceMentoring] = useState({});
  const [mentoryProps, setMentoryProps] = useState({});
  const [allMentorsAvailable, setAllMentorsAvailable] = useState([]);
  const [programMentors, setProgramMentors] = useState([]);
  const { isLoading, user } = useAuth();
  const { slug } = router.query;

  const [searchProps, setSearchProps] = useState({
    serviceSearch: '',
    mentorSearch: '',
  });

  const cohortService = serviceMentoring?.mentorship_service_sets?.find((c) => c?.slug === savedChanges?.service?.slug);

  const servicesFiltered = programServices.filter(
    (l) => l.name.toLowerCase().includes(searchProps.serviceSearch),
  );

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
      const [hours, minutes] = mentoryProps?.time.split(':');

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

  useEffect(async () => {
    if (programServices.length > 0) {
      const mentors = await getAllMentorsAvailable();
      const allConsumables = await bc.payment().service().consumable()
        .then((res) => res?.data);

      setServiceMentoring(allConsumables);
      setAllMentorsAvailable(mentors);
    }
  }, [programServices]);

  const isAvailableForConsumables = cohortSession?.available_as_saas === true;

  return !isLoading && user?.id && (
    <>
      {!isAvailableForConsumables && flags?.appReleaseShowConsumedMentorships ? (
        <MentoringConsumables
          {...{
            mentoryProps,
            width,
            serviceMentoring,
            cohortService,
            setMentoryProps,
            programServices,
            dateFormated,
            servicesFiltered,
            searchProps,
            setSearchProps,
            setProgramMentors,
            savedChanges,
            setSavedChanges,
            setServiceMentoring,
            mentorsFiltered,
            step1,
            step2,
            dateFormated2,
            allMentorsAvailable,
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
    </>
  );
};

Mentoring.propTypes = {
  programServices: PropTypes.arrayOf(PropTypes.object).isRequired,
  width: PropTypes.string,
  flags: PropTypes.objectOf(PropTypes.any).isRequired,
};

Mentoring.defaultProps = {
  width: '100%',
};

export default memo(Mentoring);

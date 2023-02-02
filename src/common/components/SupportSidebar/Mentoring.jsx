/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import {
  memo, useState, forwardRef, useEffect,
} from 'react';
import {
  Box, useColorMode, useColorModeValue, Input, InputRightElement, InputGroup, Button, Tooltip, toast,
} from '@chakra-ui/react';
// import getDay from 'date-fns/getDay';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
// import ReactDatePicker from 'react-datepicker';
// import { ChevronDownIcon } from '@chakra-ui/icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'next/router';
import { useFlags } from 'launchdarkly-react-client-sdk';
import Icon from '../Icon';
import Text from '../Text';
import Image from '../Image';
import Link from '../NextChakraLink';
import Heading from '../Heading';
import useStyle from '../../hooks/useStyle';
import bc from '../../services/breathecode';
import MentoringFree from './MentoringFree';
import MentoringConsumables from './MentoringConsumables';
import useAuth from '../../hooks/useAuth';
// import { usePersistent } from '../../hooks/usePersistent';

const Mentoring = ({
  width, programServices, setOpenMentors, flags,
}) => {
  const { t } = useTranslation('dashboard');
  const [savedChanges, setSavedChanges] = useState({});
  const { colorMode } = useColorMode();
  const router = useRouter();
  const [serviceMentoring, setServiceMentoring] = useState({});
  const [mentoryProps, setMentoryProps] = useState({});
  const [programMentors, setProgramMentors] = useState([]);
  const { isLoading, user } = useAuth();
  const { slug } = router.query;
  const isNotProduction = process.env.VERCEL_ENV !== 'production';

  const [searchProps, setSearchProps] = useState({
    serviceSearch: '',
    mentorSearch: '',
  });

  const commonBackground = useColorModeValue('white', 'rgba(255, 255, 255, 0.1)');
  const { borderColor, lightColor, hexColor } = useStyle();

  const cohortService = serviceMentoring?.mentorship_services?.find((c) => c?.slug === savedChanges?.service?.slug);

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

  // const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
  //   <Button
  //     size={['md', 'md', 'lg', 'lg']}
  //     display="inline-block"
  //     colorScheme="blue"
  //     variant="ghost"
  //     onClick={onClick}
  //     ref={ref}
  //     marginLeft={['5px', '5px', '10px', '10px']}
  //   >
  //     {value || t('common:select')}
  //     {' '}
  //     <ChevronDownIcon />
  //   </Button>
  // ));

  const dateFormated = {
    en: mentoryProps?.date && format(new Date(mentoryProps.date), 'MMMM dd'),
    es: mentoryProps?.date && format(new Date(mentoryProps.date), "dd 'de' MMMM", { locale: es }),
  };

  const dateFormated2 = {
    en: mentoryProps?.date && format(new Date(mentoryProps.date), 'MMMM dd, yyyy'),
    es: mentoryProps?.date && format(new Date(mentoryProps.date), "dd 'de' MMMM, yyyy", { locale: es }),
  };

  // const isWeekday = (date) => {
  //   const day = getDay(date);
  //   return day !== 0 && day !== 6;
  // };

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

  const mentoryFormStarted = mentoryProps?.service || mentoryProps?.mentor || mentoryProps?.date;
  const step1 = !mentoryProps?.service;
  const step2 = mentoryProps?.service && !mentoryProps?.date;
  // const step3 = mentoryProps?.service
  //   && mentoryProps?.mentor
  //   && mentoryProps?.date
  //   && !mentoryProps.time;
  // const mentoryFormCompleted = mentoryProps?.service
  //   && mentoryProps?.mentor
  //   && mentoryProps?.date
  //   && mentoryProps?.time;

  const handleService = (service) => {
    bc.mentorship({
      service: service.slug,
      status: 'ACTIVE',
      syllabus: slug,
    }).getMentor()
      .then((res) => {
        setProgramMentors(res.data);
        setTimeout(() => {
          setMentoryProps({ ...mentoryProps, service });
          setSavedChanges({ ...savedChanges, service });
        }, 50);
      })
      .catch(() => {
        toast({
          title: 'Error',
          description: t('alert-message:error-finding-mentors'),
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
      });

    bc.payment({
      mentorship_service: service.id,
    }).service().consumable()
      .then((res) => {
        setServiceMentoring(res.data);
      });
  };

  return !isLoading && user?.id && (
    <>
      {flags?.appReleaseShowConsumedMentorships ? (
        <MentoringConsumables
          {...{
            mentoryProps,
            width,
            serviceMentoring,
            cohortService,
            setMentoryProps,
            setOpenMentors,
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
          }}
        />
      ) : (
        <MentoringFree
          {...{
            mentoryProps,
            width,
            setMentoryProps,
            setOpenMentors,
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
          }}
        />
      )}
    </>
  );
};

Mentoring.propTypes = {
  programServices: PropTypes.arrayOf(PropTypes.object).isRequired,
  width: PropTypes.string,
  setOpenMentors: PropTypes.func.isRequired,
  flags: PropTypes.objectOf(PropTypes.any).isRequired,
};

Mentoring.defaultProps = {
  width: '100%',
};

export default memo(Mentoring);

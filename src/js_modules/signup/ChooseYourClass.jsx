import {
  Box, Button, Input, useToast,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import Heading from '../../common/components/Heading';
import bc from '../../common/services/breathecode';
import AlertMessage from '../../common/components/AlertMessage';
import { getTimeProps } from '../../utils';
import useGoogleMaps from '../../common/hooks/useGoogleMaps';
import useSignup from '../../common/store/actions/signupAction';
import ChooseDate from './ChooseDate';
import LoaderScreen from '../../common/components/LoaderScreen';

const ChooseYourClass = ({
  courseChoosed,
}) => {
  const { t } = useTranslation('signup');
  const [cohortIsLoading, setCohortIsLoading] = useState(true);
  const [availableDates, setAvailableDates] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [coords, setCoords] = useState(null);
  const [addressValue, setAddressValue] = useState('');
  const toast = useToast();
  const router = useRouter();
  const autoCompleteRef = useRef();
  const inputRef = useRef();
  const buttonRef = useRef();
  const GOOGLE_KEY = process.env.GOOGLE_GEO_KEY;
  const { isSecondStep, setLocation } = useSignup();

  const { gmapStatus, geocode, getNearestLocation } = useGoogleMaps(
    GOOGLE_KEY,
    'places',
  );

  const { syllabus } = router.query;
  const getCohortRequests = () => {
    if (syllabus || courseChoosed) {
      return {
        coordinates: coords?.latitude && `${coords.latitude},${coords.longitude}`,
        saas: true,
        syllabus_slug: syllabus || courseChoosed,
        upcoming: true,
      };
    }
    return {
      coordinates: coords?.latitude && `${coords.latitude},${coords.longitude}`,
      saas: true,
      upcoming: true,
    };
  };

  const cohortRequests = getCohortRequests();

  useEffect(() => {
    if (isSecondStep) {
      setCohortIsLoading(true);

      bc.public({
        ...cohortRequests,
      })
        .cohorts()
        .then(({ data }) => {
          const formatedData = data.map((date) => {
            const { kickoffDate, shortWeekDays, availableTime } = getTimeProps(date);
            return {
              ...date,
              kickoffDate,
              shortWeekDays,
              availableTime,
            };
          });
          setAvailableDates(formatedData);
          if (data.length < 1) {
            toast({
              title: t('alert-message:no-cohorts-found'),
              status: 'info',
              duration: 5000,
            });
          }
        })
        .catch((error) => {
          toast({
            title: t('alert-message:something-went-wrong-fetching-cohorts'),
            description: error.message,
            status: 'error',
            duration: 8000,
            isClosable: true,
          });
        })
        .finally(() => setCohortIsLoading(false));
    } else {
      setCohortIsLoading(false);
    }
  }, [coords, isSecondStep]);

  useEffect(() => {
    // autocomplete values for input
    if (isSecondStep && gmapStatus.loaded) {
      // initialize;
      autoCompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
      );
      autoCompleteRef.current.addListener('place_changed', async () => {
        const place = await autoCompleteRef.current.getPlace();
        if (place?.geometry) {
          setCoords({
            latitude: place?.geometry?.location?.lat(),
            longitude: place?.geometry?.location?.lng(),
          });
        }
      });

      // search button handler
      buttonRef.current.addEventListener('click', () => {
        setIsLoading(true);
        geocode({ address: addressValue })
          .then((results) => {
            setCoords({
              latitude: results.geometry.location.lat(),
              longitude: results.geometry.location.lng(),
            });
          })
          .catch(() => {
            toast({
              title: t('alert-message:google-maps-no-coincidences'),
              status: 'warning',
              duration: 5000,
            });
          })
          .finally(() => setIsLoading(false));
      });
    }
  }, [isSecondStep, gmapStatus]);

  useEffect(() => {
    if (gmapStatus.loaded) {
      getNearestLocation(GOOGLE_KEY).then(({ data }) => {
        if (data) {
          setCoords({
            latitude: data.location.lat,
            longitude: data.location.lng,
          });
        }

        geocode({ location: data.location }).then((result) => {
          setLocation({
            country: result[0]?.address_components[6]?.long_name,
            city: result[0]?.address_components[5]?.long_name,
          });
        });
      });
    }
  }, [gmapStatus]);

  const LoaderContent = () => (cohortIsLoading ? (
    <Box display="flex" justifyContent="center" mt="4rem" mb="8rem" position="relative">
      <LoaderScreen width="130px" height="130px" />
    </Box>
  ) : (
    <AlertMessage type="info" message={t('no-date-available')} />
  ));

  return isSecondStep && (
    <>
      <Heading size="18px">{t('your-address')}</Heading>
      <Box display="flex" gridGap="18px" alignItems="center" mt="10px">
        <Input
          ref={inputRef}
          id="address-input"
          onChange={(e) => setAddressValue(e.target.value)}
          className="controls"
          type="text"
          placeholder={t('address')}
          height="50px"
        />

        <Button
          type="button"
          height="50px"
          ref={buttonRef}
          isLoading={isLoading}
          value="Geocode"
          variant="default"
        >
          {t('search-dates')}
        </Button>
      </Box>
      <Box
        display="flex"
        flex={1}
        flexDirection="column"
        fontSize="12px"
        color="blue.default2"
        mt="-12px"
        w="80%"
      >
        {t('addres-info')}
      </Box>
      <Heading size="18px" m="1rem 0 1rem 0">
        {t('available-dates')}
      </Heading>
      <Box
        display="flex"
        flexDirection="column"
        mb="2rem"
        gridGap="40px"
        p="0 1rem"
      >
        {availableDates?.length > 0 && !cohortIsLoading ? (
          availableDates.map((cohort, index) => (
            <ChooseDate key={cohort?.id} index={index} cohort={cohort} />
          ))
        ) : (
          <LoaderContent />
        )}
      </Box>
      <Box as="hr" width="100%" margin="10px 0" />
    </>
  );
};

ChooseYourClass.propTypes = {
  courseChoosed: PropTypes.string,
};
ChooseYourClass.defaultProps = {
  courseChoosed: '',
};

export default ChooseYourClass;

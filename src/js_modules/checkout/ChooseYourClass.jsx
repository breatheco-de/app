import {
  Box, Button, Input, useToast,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useRef, useState } from 'react';
import Heading from '../../common/components/Heading';
import bc from '../../common/services/breathecode';
import AlertMessage from '../../common/components/AlertMessage';
import { getQueryString, getTimeProps } from '../../utils';
import useGoogleMaps from '../../common/hooks/useGoogleMaps';
import useSignup from '../../common/store/actions/signupAction';
import ChooseDate from './ChooseDate';
import useStyle from '../../common/hooks/useStyle';
import { reportDatalayer } from '../../utils/requests';
import { CardSkeleton } from '../../common/components/Skeleton';

function LoaderContent({ cohortIsLoading }) {
  const { t } = useTranslation('signup');

  return cohortIsLoading ? (
    <CardSkeleton
      quantity={1}
      display="flex"
      gridGap="40px"
      flexDirection="column"
      width="100%"
      cardWidth="100%"
      cardHeight="120px"
    />
  ) : (
    <AlertMessage type="info" message={t('no-date-available')} />
  );
}

function ChooseYourClass({
  setCohorts,
}) {
  const { t } = useTranslation('signup');
  const [cohortIsLoading, setCohortIsLoading] = useState(true);
  const [availableDates, setAvailableDates] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [coords, setCoords] = useState(null);
  const [addressValue, setAddressValue] = useState('');
  const toast = useToast();
  const autoCompleteRef = useRef();
  const inputRef = useRef();
  const buttonRef = useRef();
  const GOOGLE_KEY = process.env.GOOGLE_GEO_KEY;
  const { isSecondStep, setLocation } = useSignup();
  const { backgroundColor, backgroundColor3 } = useStyle();

  const plan = getQueryString('plan');
  const planFormated = plan ? encodeURIComponent(plan) : undefined;

  const { gmapStatus, geocode, getNearestLocation } = useGoogleMaps(
    GOOGLE_KEY,
    'places',
  );

  useEffect(() => {
    reportDatalayer({
      dataLayer: {
        event: 'checkout_choose_your_class',
      },
    });
  }, []);

  useEffect(() => {
    setCohortIsLoading(true);

    bc.public({
      coordinates: coords?.latitude && `${coords.latitude},${coords.longitude}`,
      saas: true,
      upcoming: true,
      plan: planFormated,
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

        const filteredCohorts = Array.isArray(formatedData) ? formatedData.filter((item) => item?.never_ends === false) : null;
        setCohorts({
          cohorts: filteredCohorts,
          loading: false,
        });
        setAvailableDates(filteredCohorts);
      })
      .catch((error) => {
        toast({
          position: 'top',
          title: t('alert-message:something-went-wrong-fetching-cohorts'),
          description: error.message,
          status: 'error',
          duration: 8000,
          isClosable: true,
        });
      })
      .finally(() => setCohortIsLoading(false));
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
              position: 'top',
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
    const userLocation = localStorage.getItem('user-location');
    if (gmapStatus.loaded && GOOGLE_KEY && !userLocation) {
      getNearestLocation(GOOGLE_KEY).then(({ data }) => {
        if (data) {
          setCoords({
            latitude: data.location.lat,
            longitude: data.location.lng,
          });
        }

        geocode({ location: data.location }).then((results) => {
          const loc = {};

          results[0].address_components.forEach((comp) => {
            if (comp.types.includes('locality')) loc.city = comp.long_name;
            if (comp.types.includes('country')) {
              loc.country = comp.long_name;
              loc.countryShort = comp.short_name;
            }
          });
          localStorage.setItem('user-location', JSON.stringify(loc));
          setLocation(loc);
        });
      });
    } else if (userLocation) {
      setLocation(JSON.parse(userLocation));
    }
  }, [gmapStatus]);

  return isSecondStep && (
    <Box
      display="flex"
      flexDirection="column"
      gridGap="24px"
      padding="24px 0"
      backgroundColor={backgroundColor}
      maxWidth="490px"
      justifyContent="center"
      margin="0 auto"
    >
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
          display={{ base: 'none', md: 'block' }}
          type="button"
          height="50px"
          ref={buttonRef}
          isLoading={isLoading}
          value="Geocode"
          variant="default"
          flexShrink={0}
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

      <Button
        display={{ base: 'block', md: 'none' }}
        width="fit-content"
        margin="0 0 0 auto"
        type="button"
        padding="12px 24px"
        ref={buttonRef}
        isLoading={isLoading}
        value="Geocode"
        variant="default"
        flexShrink={0}
      >
        {t('search-dates')}
      </Button>

      <Heading size="18px" m="1rem 0 1rem 0">
        {t('available-dates')}
      </Heading>
      <Box
        display="flex"
        flexDirection="column"
        mb={{ base: '0', md: '2rem' }}
        gridGap="40px"
      >
        {Array.isArray(availableDates) && availableDates?.length > 0 && !cohortIsLoading ? (
          availableDates.map((cohort, index) => (
            <ChooseDate key={cohort?.id} index={index} cohort={cohort} background={backgroundColor3} padding="13px" borderRadius="4px" />
          ))
        ) : (
          <LoaderContent cohortIsLoading={cohortIsLoading} />
        )}
      </Box>
    </Box>
  );
}

ChooseYourClass.propTypes = {
  setCohorts: PropTypes.func,
};
ChooseYourClass.defaultProps = {
  setCohorts: () => {},
};
LoaderContent.propTypes = {
  cohortIsLoading: PropTypes.bool.isRequired,
};

export default ChooseYourClass;

/* eslint-disable react/prop-types */
import {
  Box, Button, Input, Img, useToast,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import Heading from '../../common/components/Heading';
import bc from '../../common/services/breathecode';
import Text from '../../common/components/Text';
import AlertMessage from '../../common/components/AlertMessage';
import { getTimeProps } from '../../utils';
import useGoogleMaps from '../../common/hooks/useGoogleMaps';

const ChooseYourClass = ({
  isSecondStep, courseChoosed, handleChooseDate, setLocation,
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

  const { gmapStatus, geocode, getNearestLocation } = useGoogleMaps(
    GOOGLE_KEY,
    'places',
  );

  useEffect(() => {
    if (coords !== null && isSecondStep) {
      setCohortIsLoading(true);

      bc.public({
        coordinates: `${coords.latitude},${coords.longitude}`,
        saas: true,
        syllabus_slug: courseChoosed,
        upcoming: true,
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
    <Box display="flex" justifyContent="center" mt="2rem" mb="10rem">
      <Img
        src="/4Geeks.ico"
        width="35px"
        height="35px"
        position="absolute"
        mt="6px"
        zIndex="40"
        boxShadow="0px 0px 16px 0px #0097cd"
        borderRadius="40px"
      />
      <Box className="loader" />
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
          availableDates.map((date, i) => {
            const kickoffDate = {
              en:
                date?.kickoff_date
                && format(new Date(date.kickoff_date), 'MMM do'),
              es:
                date?.kickoff_date
                && format(new Date(date.kickoff_date), 'MMM d', {
                  locale: es,
                }),
            };

            const dateIndex = i;
            return (
              <Box display="flex" gridGap="30px" key={dateIndex}>
                <Text size="18px" flex={0.35}>
                  {date.syllabus_version.name}
                </Text>
                <Box
                  display="flex"
                  flexDirection="column"
                  gridGap="5px"
                  flex={0.2}
                  textTransform="capitalize"
                >
                  <Text size="18px">
                    {kickoffDate[router.locale]}
                  </Text>
                  {date?.shortWeekDays[router.locale].length > 0 && (
                    <Text size="14px" color="gray.default">
                      {date?.shortWeekDays[router.locale].map(
                        (day, index) => `${day}${index < date?.shortWeekDays[router.locale].length - 1 ? '/' : ''}`,
                      )}
                    </Text>
                  )}
                </Box>
                <Box
                  display="flex"
                  flexDirection="column"
                  gridGap="5px"
                  flex={0.3}
                >
                  <Text size="18px">{date?.availableTime}</Text>
                  <Text size="14px" color="gray.default">
                    {date?.timezone}
                  </Text>
                </Box>
                <Button
                  variant="outline"
                  onClick={() => handleChooseDate(date)}
                  borderColor="currentColor"
                  color="blue.default"
                  flex={0.15}
                >
                  {t('choose-date')}
                </Button>
              </Box>
            );
          })
        ) : (
          <LoaderContent />
        )}
      </Box>
      <Box as="hr" width="100%" margin="10px 0" />
    </>
  );
};

export default ChooseYourClass;

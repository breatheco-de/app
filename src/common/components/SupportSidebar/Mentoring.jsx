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
import Icon from '../Icon';
import Text from '../Text';
import Image from '../Image';
import Link from '../NextChakraLink';
import Heading from '../Heading';
import useStyle from '../../hooks/useStyle';
import bc from '../../services/breathecode';
// import { usePersistent } from '../../hooks/usePersistent';

const Mentoring = ({
  width, programServices, setOpenMentors,
}) => {
  const { t } = useTranslation('dashboard');
  const [savedChanges, setSavedChanges] = useState({});
  const { colorMode } = useColorMode();
  const router = useRouter();
  const [serviceMentoring, setServiceMentoring] = useState({});
  const [mentoryProps, setMentoryProps] = useState({});
  const [programMentors, setProgramMentors] = useState([]);
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

  // TODO: use flags here
  return (
    <Box
      position="relative"
      backgroundColor={colorMode === 'light' ? 'yellow.light' : 'featuredDark'}
      width={width}
      height="auto"
      borderWidth="0px"
      borderRadius="lg"
      overflow="hidden"
    >
      <Box display="flex" justifyContent="center" alignItems="center" width="85px" height="50px" margin="0 auto" borderBottomRadius="10px" backgroundColor="yellow.default">
        <Icon icon="idea" width="36px" height="36px" />
      </Box>
      {mentoryProps?.service && (serviceMentoring?.mentorship_services?.length !== 0 && cohortService?.balance?.unit !== 0) && (
        <Box position="absolute" top="16px" left="18px" onClick={() => setMentoryProps({})} cursor="pointer">
          <Icon icon="arrowLeft" width="25px" height="25px" color="#606060" />
        </Box>
      )}
      {(!mentoryProps?.service || serviceMentoring?.mentorship_services?.length !== 0 || cohortService?.balance?.unit >= 0) && (
        <Box position="absolute" top="16px" right="18px" onClick={() => setOpenMentors(false)} cursor="pointer">
          <Icon icon="close" width="15px" height="15px" color="#606060" />
        </Box>
      )}
      <Box display="flex" flexDirection="column" p="4" pb={mentoryFormStarted ? '0px' : '30px'} pt="20px" alignItems="center">
        <Box d="flex" flexDirection="column" alignItems="center" justifyContent="center">
          <Heading size="sm" textAlign="center" justify="center" mt="0px" mb="0px">
            {t('supportSideBar.mentoring')}
          </Heading>
          {!mentoryProps?.service && programServices.length <= 0 && (
            <Heading size="16px" textAlign="center" justify="center" mt="10px" mb="0px">
              {programServices.length > 0 ? `${programServices.length} ${t('supportSideBar.mentoring-available')}` : t('supportSideBar.no-mentoring-available')}
              {/* {t('supportSideBar.no-mentoring-available')} */}
            </Heading>
          )}
        </Box>

        {isNotProduction && mentoryProps?.service && !mentoryProps?.mentor && serviceMentoring?.mentorship_services?.length > 0 && cohortService?.balance?.unit !== 0 && (
          <Box display="flex" alignItems="center" fontSize="18px" fontWeight={700} gridGap="10px" padding="0 10px" margin="10px 0 0px 0">
            <Box>
              {t('mentorship.you-have')}
            </Box>
            <Box display="flex" color="white" justifyContent="center" alignItems="center" background="green.400" width="30px" height="30px" borderRadius="50%">
              {cohortService?.balance?.unit > 0 ? cohortService?.balance?.unit : ''}
              {cohortService?.balance?.unit === -1 ? (
                <Icon icon="infinite" width="20px" height="20px" />
              ) : ''}
            </Box>
            <Box textAlign="center">
              {t('mentorship.available-sessions')}
            </Box>
          </Box>
        )}
        {mentoryProps?.service && !mentoryProps?.mentor && (serviceMentoring?.mentorship_services?.length === 0 || cohortService?.balance?.unit === 0) ? (
          <Box display="flex" flexDirection="column" alignItems="center">
            <Box display="flex" gridGap="10px" padding="0 10px" margin="8px 0 8px 0">
              <Tooltip placement="top" hasArrow label={t('mentorship.tooltip')}>
                <Box>
                  <Icon icon="info" width="28px" height="28px" color={hexColor.yellowDefault} />
                </Box>
              </Tooltip>
              <Box fontSize="18px" fontWeight={700}>
                {t('mentorship.no-mentorship')}
              </Box>
            </Box>
            <Box as="hr" borderColor="yellow.default" borderWidth="0.5px" width="100%" margin="10px 0 20px 0" />
            <Box fontSize="14px" fontWeight={400} letterSpacing="0.05em" padding="0 10px" color={lightColor}>
              <Link variant="default" href="/signup">
                {t('common:upgrade')}
              </Link>
              {' '}
              {t('mentorship.get-unlimited-mentorship')}
            </Box>

            <Button variant="link" fontSize="14px" onClick={() => setMentoryProps({})} letterSpacing="0.05em">
              {t('common:go-back')}
            </Button>
          </Box>
        ) : (
          <>
            {!mentoryProps?.time ? (
              <>
                <Box d="flex" alignItems="baseline" justifyContent="center">
                  {programServices.length > 0 ? (
                    <>
                      {!mentoryProps?.service && (
                        <Text
                          size="md"
                          textAlign="center"
                          mt="10px"
                          px="0px"
                        >
                          {t('supportSideBar.start-mentorship')}
                        </Text>
                      )}
                    </>
                  ) : ''}
                  {/* <Text
                    size="md"
                    textAlign="center"
                    mt="10px"
                    px="0px"
                    dangerouslySetInnerHTML={{ __html: '<a class="link" href="#" style="font-size: 14px">Upgrade your membership</a> to have unlimited mentorships.<br/><br/> Available mentorships until october the 3rd' }}
                  /> */}
                </Box>
                {mentoryProps?.service && (
                  <Box display="flex" alignItems="center" justifyContent="flex-start" gridGap="10px" background={commonBackground} mt="20px" px="20px" py="15px" textAlign="center" w="100%" borderTopRadius="0.375rem">
                    <Box>
                      <Icon icon="checked2" width="15px" height="15px" color={hexColor.greenLight} />
                    </Box>
                    <Box width="auto">
                      {mentoryProps.service.name}
                    </Box>
                  </Box>
                )}
                {mentoryProps?.mentor && (
                  <Box background={commonBackground} display="flex" gridGap="14px" justifyContent="center" alignItems="center" py="15px" w="100%" borderTop="1px solid" borderColor={borderColor} borderBottomRadius={!mentoryProps?.date ? '0.375rem' : '0'}>
                    <Image
                      src={mentoryProps.mentor?.user.profile?.avatar_url}
                      alt={`selected ${mentoryProps.mentor?.user?.first_name} ${mentoryProps.mentor?.user?.last_name}`}
                      width="40px"
                      height="40px"
                      objectFit="cover"
                      style={{ minWidth: '40px', width: '40px !important', height: '40px !important' }}
                      styleImg={{ borderRadius: '50px' }}
                    />
                    <Box>
                      <Box fontWeight="700" fontSize="15px" color={useColorModeValue('gray.900', 'white')} letterSpacing="0.05em">
                        {`${mentoryProps.mentor.user.first_name} ${mentoryProps.mentor.user.last_name}`}
                      </Box>
                      <Box fontWeight="400" fontSize="15px" letterSpacing="0.05em">
                        {`${parseInt(mentoryProps.service.duration, 10) / 60} min Mentoring Session`}
                      </Box>
                    </Box>
                  </Box>
                )}
                {mentoryProps?.date && (
                  <Box background={commonBackground} py="15px" textAlign="center" borderTop="1px solid" borderColor={borderColor} w="100%" borderBottomRadius="0.375rem">
                    {dateFormated[router.locale]}
                  </Box>
                )}

                {!mentoryProps?.service && programServices.length > 0 && (
                  <>
                    <InputGroup mt="24px">
                      <Input onChange={(e) => setSearchProps({ ...searchProps, serviceSearch: e.target.value?.toLocaleLowerCase() })} background={commonBackground} borderBottomRadius="0" border="0" placeholder={t('supportSideBar.select-type')} />
                      <InputRightElement>
                        <Icon icon="arrowDown" color="#606060" width="35px" height="30px" ml="10px" />
                      </InputRightElement>
                    </InputGroup>
                    <Box maxHeight="10rem" width="100%" overflow="auto" borderBottomRadius="0.375rem">
                      {servicesFiltered.length > 0 ? servicesFiltered.map((service) => (
                        <Box borderTop="1px solid" cursor="pointer" onClick={() => handleService(service)} borderColor={borderColor} py="14px" background={commonBackground} width="100%" px="22px" _hover={{ background: useColorModeValue('featuredLight', 'gray.700') }}>
                          {service.name}
                        </Box>
                      )) : (
                        <Box borderTop="1px solid" borderColor={borderColor} py="14px" background={commonBackground} width="100%" px="22px">
                          {t('common:search-not-found')}
                        </Box>
                      )}
                    </Box>
                  </>
                )}

                {mentoryProps?.service && !mentoryProps?.mentor
                  && (
                    <>
                      <InputGroup mt="24px" borderBottom="1px solid" borderColor={borderColor}>
                        <Input onChange={(e) => setSearchProps({ ...searchProps, mentorSearch: e.target.value?.toLowerCase() })} background={commonBackground} borderBottomRadius="0" border="0" placeholder={t('supportSideBar.search-mentor')} />
                        <InputRightElement>
                          <Icon icon="arrowDown" color="#606060" width="35px" height="30px" ml="10px" />
                        </InputRightElement>
                      </InputGroup>
                      <Box maxHeight="18rem" width="100%" background={commonBackground} overflow="auto" borderBottomRadius="0.375rem">
                        {mentorsFiltered.length > 0 ? mentorsFiltered.map((mentor, i) => (
                          <>
                            {i !== 0 && (
                              <Box as="hr" borderColor="gray.300" margin="0 18px" />
                            )}
                            <Box display="flex" gridGap="18px" flexDirection="row" py="14px" width="100%" px="18px" _hover={{ background: useColorModeValue('featuredLight', 'gray.700') }}>
                              {/* onClick={() => { setMentoryProps({ ...mentoryProps, mentor }); setSavedChanges({ ...savedChanges, mentor }); }} */}
                              <Image
                                src={mentor?.user.profile?.avatar_url}
                                alt={`${mentor?.user?.first_name} ${mentor?.user?.last_name}`}
                                width="78px"
                                height="78px"
                                objectFit="cover"
                                style={{ minWidth: '78px', width: '78px !important', height: '78px !important' }}
                                styleImg={{ borderRadius: '50px' }}
                              />
                              <Box display="flex" flexDirection="column" width="100%">
                                <Box fontSize="15px" fontWeight="600">
                                  {`${mentor.user.first_name} ${mentor.user.last_name}`}
                                </Box>
                                <Box as="hr" borderColor={borderColor} my="5px" />
                                <Box textTransform="capitalize">
                                  {(mentor.one_line_bio && mentor.one_line_bio !== '') ? `${mentor.one_line_bio} ` : ''}
                                  {mentor?.booking_url ? (
                                    <Link variant="default" href={mentor?.booking_url} target="_blank" rel="noopener noreferrer">
                                      {t('supportSideBar.create-session-text', { name: mentor.user.first_name })}
                                    </Link>
                                  ) : (
                                    <Box fontSize="15px">
                                      {t('supportSideBar.no-mentor-link')}
                                    </Box>
                                  )}
                                </Box>
                              </Box>
                            </Box>
                          </>
                        )) : (
                          <Box borderTop="1px solid" borderColor={borderColor} py="14px" background={commonBackground} width="100%" px="22px">
                            {t('supportSideBar.no-mentors')}
                          </Box>
                        )}
                      </Box>
                    </>
                  )}
                {/* {mentoryProps?.mentor && !mentoryProps?.date && (
                  <Box width="100%" textAlign="center" mt="10px" background={commonBackground} borderRadius="0.375rem">
                    <Box width="100%" textAlign="center" color={useColorModeValue('gray.600', 'gray.200')} py="14px" borderBottom="1px solid" borderColor={borderColor} mb="10px">
                      Select a day
                    </Box>
                    <Box>
                      <ReactDatePicker
                        wrapperClassName="datePicker"
                        selected={mentoryProps?.date}
                        onChange={(date) => {
                          setMentoryProps({ ...mentoryProps, date });
                          setSavedChanges({ ...savedChanges, date });
                        }}
                        customInput={<ExampleCustomInput />}
                        filterDate={isWeekday}
                        dateFormat="dd/MM/yyyy"
                        inline
                      />
                    </Box>
                  </Box>
                )}
                {mentoryProps?.date && !mentoryProps?.time && (
                  <Box width="100%" textAlign="center" mt="10px" background={commonBackground} borderRadius="0.375rem">
                    <Box width="100%" textAlign="center" color={useColorModeValue('gray.600', 'gray.200')} py="14px" borderBottom="1px solid" borderColor={borderColor}>
                      Select a time
                    </Box>
                    <Box p="15px 0 8px 0">
                      <ReactDatePicker
                        selected={mentoryProps?.time}
                        onChange={(time) => {
                          setMentoryProps({ ...mentoryProps, time: format(new Date(time), 'HH:mm') });
                          setSavedChanges({ ...savedChanges, time: format(new Date(time), 'HH:mm') });
                        }}
                        inline
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={60}
                        timeCaption=""
                        // dateFormat="h:mm aa"
                        timeFormat="HH:mm"
                        minTime={new Date(1970, 1, 1, 15, 0)}
                        maxTime={new Date(1970, 1, 1, 17, 0)}
                        // new Date() - 1000 * 60 * 60 * 24, // yesterday
                      />
                    </Box>
                  </Box>
                )}
                {programServices.length <= 0 && (
                  <Box className="link" onClick={() => setOpenMentors(false)} pt="26px">
                    Go back
                  </Box>
                )} */}
              </>
            ) : (
              <>
                {mentoryProps?.mentor && mentoryProps?.date && mentoryProps?.time && (
                  <Box display="flex" flexDirection="column" background={commonBackground} borderRadius="3px" mt="22px" gridGap="14px" justifyContent="center" alignItems="center" p="25px 0 25px 0" w="100%">
                    {!mentoryProps?.confirm ? (
                      <Image
                        src={mentoryProps.mentor?.user.profile?.avatar_url}
                        alt={`selected ${mentoryProps.mentor?.user?.first_name} ${mentoryProps.mentor?.user?.last_name}`}
                        width="68px"
                        height="68px"
                        objectFit="cover"
                        style={{ minWidth: '68px', width: '68px !important', height: '68px !important' }}
                        styleImg={{ borderRadius: '50px' }}
                      />
                    ) : (
                      <Icon icon="verified" width="68px" height="68px" />
                    )}
                    <Box margin="0 10px" display="flex" flexDirection="column">
                      <Box fontWeight="700" textAlign="center" fontSize="15px" color={useColorModeValue('gray.900', 'white')} letterSpacing="0.05em">
                        {`${mentoryProps.mentor.user.first_name} ${mentoryProps.mentor.user.last_name} - ${mentoryProps?.service?.name}`}
                      </Box>
                      <Box fontWeight="400" fontSize="15px" color={lightColor} textAlign="center" letterSpacing="0.05em">
                        {dateFormated2[router.locale]}
                      </Box>
                      <Box fontWeight="400" fontSize="15px" color={lightColor} textAlign="center" letterSpacing="0.05em">
                        {`${mentoryProps.time} hs.`}
                      </Box>

                      {!mentoryProps?.confirm && (
                        <Button variant="default" onClick={() => setMentoryProps({ ...mentoryProps, confirm: true })} textTransform="uppercase" margin="15px auto 10px auto">
                          Confirm
                        </Button>
                      )}
                      {mentoryProps?.confirm && (
                        <Button variant="default" onClick={() => setOpenMentors(false)} textTransform="uppercase" margin="15px auto 10px auto">
                          Done
                        </Button>
                      )}
                      {!mentoryProps?.confirm && (
                        <Box onClick={() => setMentoryProps({ ...mentoryProps, time: null })} className="link" width="fit-content" margin="0 auto">
                          Go back
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}
              </>
            )}
          </>
        )}

        <Box display="flex" gridGap="8px" position="relative" py="20px">
          <Box onClick={() => setMentoryProps({})} cursor="pointer">
            <Icon icon="dot" color={step1 ? '#0097CD' : '#DADADA'} width="10px" height="10px" />
          </Box>
          <Box
            onClick={() => setMentoryProps({
              ...savedChanges, mentor: null, date: null, time: null,
            })}
            cursor="pointer"
          >
            <Icon icon="dot" color={step2 ? '#0097CD' : '#DADADA'} width="10px" height="10px" />
          </Box>
          {/* <Box
            onClick={() => {
              setMentoryProps({
                ...savedChanges, time: null,
              });
            }}
            cursor="pointer"
          >
            <Icon icon="dot" color={step3 ? '#0097CD' : '#DADADA'} width="10px" height="10px" />
          </Box>
          <Box
            onClick={() => {
              setMentoryProps({ ...savedChanges });
            }}
            cursor="pointer"
          >
            <Icon icon="dot" color={mentoryFormCompleted ? '#0097CD' : '#DADADA'} width="10px" height="10px" />
          </Box> */}
        </Box>

      </Box>
    </Box>
  );
};

Mentoring.propTypes = {
  programServices: PropTypes.arrayOf(PropTypes.object).isRequired,
  width: PropTypes.string,
  setOpenMentors: PropTypes.func.isRequired,
};

Mentoring.defaultProps = {
  width: '100%',
};

export default memo(Mentoring);

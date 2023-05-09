/* eslint-disable react/prop-types */
import { Avatar, AvatarGroup, Box, Button, Input, InputGroup, InputRightElement, useColorModeValue, useToast } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { useState } from 'react';
import useStyle from '../../hooks/useStyle';
import Heading from '../Heading';
import Icon from '../Icon';
import Image from '../Image';
import Link from '../NextChakraLink';
// import Text from '../Text';
import bc from '../../services/breathecode';
import useOnline from '../../hooks/useOnline';
import AvatarUser from '../../../js_modules/cohortSidebar/avatarUser';
import Text from '../Text';
import { AvatarSkeletonWrapped } from '../Skeleton';

const NoConsumablesCard = ({ t, setMentoryProps, disableBackButton = false }) => (
  <Box display="flex" flexDirection="column" alignItems="center">
    <Heading size="14px" textAlign="center" lineHeight="16.8px" justify="center" mt="0px" mb="0px">
      {t('mentorship.no-mentorship')}
      <br />
      <Link size="14px" variant="default" className="link" href={t('supportSideBar.learn-more-link')} target="_blank" rel="noopener noreferrer">
        {t('supportSideBar.learn-more')}
      </Link>
    </Heading>
    <Avatar
      width="55px"
      height="55px"
      margin="16px 0"
      style={{ userSelect: 'none' }}
      src="/static/images/angry-avatar.png"
    />
    <Link display="flex" variant="buttonDefault" fontSize="14px" fontWeight={700} href="/checkout" alignItems="center" gridGap="10px">
      {t('supportSideBar.get-more-mentorships')}
      <Icon icon="longArrowRight" width="24px" height="10px" color="currentColor" />
    </Link>

    {!disableBackButton && (
      <Button variant="link" fontSize="14px" onClick={() => setMentoryProps({})} letterSpacing="0.05em">
        {t('common:go-back')}
      </Button>
    )}
  </Box>
);

const ProfilesSection = ({
  profiles,
}) => {
  const { usersConnected } = useOnline();

  return (
    <AvatarGroup max={4}>
      {profiles?.map((c, i) => {
        const fullName = `${c.user.first_name} ${c.user.last_name}`;
        const isOnline = usersConnected?.includes(c.user.id);
        return (
          <AvatarUser
            width="48px"
            height="48px"
            index={i}
            key={`${c.id} - ${c.user.first_name}`}
            isWrapped
            fullName={fullName}
            data={c}
            isOnline={isOnline}
            badge
          />
        );
      })}
    </AvatarGroup>
  );
};

const MentoringConsumables = ({
  mentoryProps, width, serviceMentoring, cohortService, setMentoryProps,
  programServices, dateFormated, servicesFiltered, searchProps,
  setSearchProps, setProgramMentors, savedChanges, setSavedChanges, setServiceMentoring,
  mentorsFiltered, step1, step2, dateFormated2, allMentorsAvailable,
}) => {
  const { t } = useTranslation('dashboard');

  const isNotProduction = process.env.VERCEL_ENV !== 'production';
  const mentoryFormStarted = mentoryProps?.service || mentoryProps?.mentor || mentoryProps?.date;
  const commonBackground = useColorModeValue('white', 'rgba(255, 255, 255, 0.1)');
  const [open, setOpen] = useState(false);
  const { borderColor, lightColor, hexColor } = useStyle();
  const router = useRouter();
  const toast = useToast();
  const { slug } = router.query;

  const existsConsumables = serviceMentoring?.mentorship_service_sets?.length > 0 || (Array.isArray(serviceMentoring?.mentorship_service_sets) && serviceMentoring?.mentorship_service_sets.some((item) => item?.balance > 0));

  const existConsumablesOnCurrentService = serviceMentoring?.mentorship_service_sets?.length > 0 && cohortService?.balance?.unit !== 0;

  const handleService = (service) => {
    bc.mentorship({
      services: service.slug,
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
        setServiceMentoring(res?.data);
      });
  };

  return (
    <Box
      position="relative"
      backgroundColor={useColorModeValue('yellow.light', 'featuredDark')}
      width={width}
      height="auto"
      borderWidth="0px"
      borderRadius="lg"
    >
      <Box display="flex" justifyContent="center" alignItems="center" width="85px" height="50px" margin="0 auto" borderBottomRadius="10px" backgroundColor="yellow.default">
        <Icon icon="idea" width="36px" height="36px" />
      </Box>
      {mentoryProps?.service && (serviceMentoring?.mentorship_service_sets?.length !== 0 && cohortService?.balance?.unit !== 0) && (
        <Box position="absolute" top="16px" left="18px" onClick={() => setMentoryProps({})} cursor="pointer">
          <Icon icon="arrowLeft" width="25px" height="25px" color="#606060" />
        </Box>
      )}
      {existsConsumables && (!mentoryProps?.service || serviceMentoring?.mentorship_service_sets?.length !== 0 || cohortService?.balance?.unit >= 0) && (
        <Box position="absolute" top="16px" right="18px" onClick={() => setOpen(false)} cursor="pointer">
          <Icon icon="close" width="15px" height="15px" color="#606060" />
        </Box>
      )}
      <Box display="flex" flexDirection="column" p="4" pb={mentoryFormStarted ? '0px' : '30px'} pt="20px" alignItems="center">
        {existsConsumables ? (
          <>
            <Box d="flex" flexDirection="column" alignItems="center" justifyContent="center">
              {!mentoryProps?.service && (serviceMentoring?.mentorship_service_sets?.length !== 0 || cohortService?.balance?.unit !== 0) && (
                <>
                  <Heading size="14px" textAlign="center" lineHeight="16.8px" justify="center" mt="0px" mb="0px">
                    {t('supportSideBar.mentoring')}
                    <br />
                    <Link size="14px" variant="default" className="link" href={t('supportSideBar.learn-more-link')} target="_blank" rel="noopener noreferrer">
                      {t('supportSideBar.learn-more')}
                    </Link>
                  </Heading>
                  {!mentoryProps?.service && programServices.length <= 0 && (
                    <Heading size="16px" textAlign="center" justify="center" mt="10px" mb="0px">
                      {programServices.length > 0 ? `${programServices.length} ${t('supportSideBar.mentoring-available')}` : t('supportSideBar.no-mentoring-available')}
                    </Heading>
                  )}
                </>
              )}
            </Box>
            {!open && (
              <>
                <Box margin="15px 0">
                  {allMentorsAvailable.length > 0 ? (
                    <ProfilesSection profiles={allMentorsAvailable} />
                  ) : (
                    <AvatarSkeletonWrapped quantity={4} />
                  )}
                  <Text color="gray.600" size="12px" margin="8px 0 0 0">
                    {t('supportSideBar.mentors-available', { count: allMentorsAvailable.length })}
                  </Text>
                </Box>
                <Button variant="default" onClick={() => setOpen(true)}>
                  {t('supportSideBar.schedule-button')}
                  <Icon icon="longArrowRight" width="24px" height="10px" color="currentColor" />
                </Button>
              </>
            )}
          </>
        ) : <NoConsumablesCard t={t} setMentoryProps={setMentoryProps} disableBackButton />}

        {isNotProduction && open && mentoryProps?.service && !mentoryProps?.mentor && existConsumablesOnCurrentService && (
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
        {mentoryProps?.service && open && !mentoryProps?.mentor && !existConsumablesOnCurrentService ? (
          <NoConsumablesCard t={t} setMentoryProps={setMentoryProps} />
        ) : open && (
          <>
            {!mentoryProps?.time ? (
              <>
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
                        <Button variant="default" onClick={() => setOpen(false)} textTransform="uppercase" margin="15px auto 10px auto">
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

MentoringConsumables.propTypes = {
  mentoryProps: PropTypes.objectOf(PropTypes.any),
  width: PropTypes.string,
  serviceMentoring: PropTypes.objectOf(PropTypes.any),
  cohortService: PropTypes.objectOf(PropTypes.any),
  setMentoryProps: PropTypes.func.isRequired,
  programServices: PropTypes.arrayOf(PropTypes.any),
  dateFormated: PropTypes.objectOf(PropTypes.any).isRequired,
  servicesFiltered: PropTypes.arrayOf(PropTypes.any).isRequired,
  searchProps: PropTypes.objectOf(PropTypes.any).isRequired,
  setSearchProps: PropTypes.func.isRequired,
  savedChanges: PropTypes.objectOf(PropTypes.any).isRequired,
  setSavedChanges: PropTypes.func.isRequired,
  setProgramMentors: PropTypes.func,
  setServiceMentoring: PropTypes.func,
  mentorsFiltered: PropTypes.arrayOf(PropTypes.any).isRequired,
  step1: PropTypes.bool.isRequired,
  step2: PropTypes.bool.isRequired,
  dateFormated2: PropTypes.objectOf(PropTypes.any).isRequired,
};

MentoringConsumables.defaultProps = {
  mentoryProps: [],
  width: '100%',
  serviceMentoring: {},
  cohortService: {},
  programServices: [],
  setProgramMentors: () => {},
  setServiceMentoring: () => {},
};

export default MentoringConsumables;

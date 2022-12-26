import React, { useEffect, useState } from 'react';
import {
  Flex, Box, Button, useToast, Skeleton, useColorModeValue,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import getT from 'next-translate/getT';
import ChooseProgram from '../../js_modules/chooseProgram';
import Text from '../../common/components/Text';
import bc from '../../common/services/breathecode';
import asPrivate from '../../common/context/PrivateRouteWrapper';
import useAuth from '../../common/hooks/useAuth';
import Icon from '../../common/components/Icon';
import Module from '../../common/components/Module';
import { isPlural } from '../../utils';
import Heading from '../../common/components/Heading';
import { usePersistent } from '../../common/hooks/usePersistent';
import useLocalStorageQuery from '../../common/hooks/useLocalStorageQuery';
import useStyle from '../../common/hooks/useStyle';
import GridContainer from '../../common/components/GridContainer';
import LiveEvent from '../../common/components/LiveEvent';
import NextChakraLink from '../../common/components/NextChakraLink';
import useProgramList from '../../common/store/actions/programListAction';
import handlers from '../../common/handlers';

export const getStaticProps = async ({ locale, locales }) => {
  const t = await getT(locale, 'choose-program');

  return {
    props: {
      seo: {
        title: t('seo.title'),
        locales,
        locale,
        url: '/choose-program',
        pathConnector: '/choose-program',
      },
      fallback: false,
    },
  };
};

function chooseProgram() {
  const { t } = useTranslation('choose-program');
  const [, setProfile] = usePersistent('profile', {});
  const [, setCohortSession] = usePersistent('cohortSession', {});
  // const [data, setData] = useState([]);
  const [invites, setInvites] = useState([]);
  const [showInvites, setShowInvites] = useState(false);
  const [events, setEvents] = useState(null);
  const { state, programsList, updateProgramList } = useProgramList();
  const [cohortTasks, setCohortTasks] = useState({});
  // const [loader, setLoader] = useState({
  //   addmission: true,
  // });
  const { user, choose } = useAuth();
  const { featuredColor, borderColor, lightColor } = useStyle();
  const router = useRouter();
  const toast = useToast();
  const commonStartColor = useColorModeValue('gray.300', 'gray.light');
  const commonEndColor = useColorModeValue('gray.400', 'gray.400');

  const fetchAdmissions = () => bc.admissions().me();

  const options = {
    // cache 1 hour
    cacheTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  };

  const { isLoading, data: dataQuery } = useLocalStorageQuery('admissions', fetchAdmissions, { ...options }, true);

  useEffect(() => {
    if (dataQuery && Object.values(cohortTasks).length > 0) {
      updateProgramList(dataQuery?.cohorts?.reduce((acc, value) => {
        acc[value.cohort.slug] = {
          ...state[value.cohort.slug],
          ...programsList[value.cohort.slug],
          ...cohortTasks[value.cohort.slug],
          name: value.cohort.name,
          slug: value.cohort.slug,
        };
        return acc;
      }, {}));
      // setData(dataQuery?.cohorts);
      setProfile(dataQuery);
    }
  }, [dataQuery, cohortTasks]);

  useEffect(() => {
    if (dataQuery?.id) {
      // const activeCohorts = handlers.getActiveCohorts(dataQuery?.cohorts);
      dataQuery?.cohorts.map(async (item) => {
        if (item?.cohort?.slug) {
          const tasks = await bc.todo({ cohort: item?.cohort?.id }).getTaskByStudent();
          const studentAndTeachers = await bc.cohort({
            role: 'TEACHER,ASSISTANT',
            cohorts: item?.cohort?.slug,
            academy: item?.cohort?.academy?.id,
          }).getMembers();
          const teacher = studentAndTeachers?.data.filter((st) => st.role === 'TEACHER');
          const assistant = studentAndTeachers?.data?.filter((st) => st.role === 'ASSISTANT');

          setCohortTasks((prev) => ({
            ...prev,
            [item?.cohort.slug]: {
              ...handlers.handleTasks(tasks.data, true),
              teacher,
              assistant,
            },
          }));
        }
        return null;
      });
    }
  }, [dataQuery?.id]);

  const userID = user?.id;

  useEffect(() => {
    bc.public().events()
      .then((res) => setEvents(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (userID !== undefined) {
      setCohortSession({
        selectedProgramSlug: '/choose-program',
        bc_id: userID,
      });
    }
  }, [userID]);

  useEffect(() => {
    // getAdmissions();
    // setLoader((prev) => ({ ...prev, addmission: true }));
    Promise.all([
      // bc.admissions().me(),
      bc.auth().invites().get(),
    ]).then((
      [respInvites],
    ) => {
      // setData(respAdmissions?.data?.cohorts);
      // setProfile(respAdmissions.data);
      setInvites(respInvites.data);
    }).catch(() => {
      toast({
        title: t('alert-message:something-went-wrong-with', { property: 'Admissions' }),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    });
    // .finally(() => setLoader((prev) => ({ ...prev, addmission: false })));
  }, []);

  const acceptInvite = ({ id }) => {
    bc.auth().invites().accept(id).then((res) => {
      const cohortName = res.data[0].cohort.name;
      toast({
        title: t('alert-message:invitation-accepted', { cohortName }),
        // title: `Cohort ${cohortName} successfully accepted!`,
        status: 'success',
        duration: 9000,
        isClosable: true,
      });
      setTimeout(() => {
        router.reload();
      }, 800);
    });
  };

  const inviteWord = () => {
    if (isPlural(invites)) {
      return t('invite.plural-word', { invitesLength: invites.length });
    }
    return t('invite.singular-word', { invitesLength: invites.length });
  };

  const handleChoose = (cohort) => {
    choose(cohort);
  };

  return (
    <Flex alignItems="center" flexDirection="row" mt="40px">
      <GridContainer width="100%" margin="0 auto" fraction="1fr">
        <Flex flexDirection={{ base: 'column-reverse', md: 'row' }} gridGap={{ base: '1rem', md: '3.5rem' }} position="relative">
          <Box width="100%" flex={{ base: 1, md: 0.7 }}>
            <Heading
              fontWeight={800}
              size="xl"
            >
              {user?.first_name ? t('welcome-back-user', { name: user?.first_name }) : t('welcome')}
            </Heading>

            <Text size="18px" color={lightColor} fontWeight={500} letterSpacing="0.02em" p="12px 0 30px 0">
              {t('read-to-start-learning')}
            </Text>

            {invites.length > 0 && (
              <Box margin="25px 0 0 0" display="flex" alignItems="center" justifyContent="space-between" padding="16px 20px" borderRadius="18px" width={['70%', '68%', '70%', '50%']} background="yellow.light">
                <Text
                  color="black"
                  display="flex"
                  flexDirection="row"
                  gridGap="15px"
                  width="100%"
                  justifyContent="space-between"
                  size="md"
                >
                  {t('invite.notify', { cohortInvitationWord: inviteWord() })}
                  {/* {`Ey! There are ${inviteWord()} for you to accept.`} */}
                  <Text
                    as="button"
                    size="md"
                    fontWeight="bold"
                    textAlign="left"
                    gridGap="5px"
                    _focus={{
                      boxShadow: '0 0 0 3px rgb(66 153 225 / 60%)',
                    }}
                    color="blue.default"
                    display="flex"
                    alignItems="center"
                    onClick={() => setShowInvites(!showInvites)}
                  >
                    {showInvites ? t('invite.hide') : t('invite.show')}
                    <Icon
                      icon="arrowDown"
                      width="20px"
                      height="20px"
                      style={{ transform: showInvites ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </Text>
                </Text>
              </Box>
            )}

            {showInvites && invites.map((item, i) => {
              const { id } = item;
              const index = i;
              return (
                <Module
                  key={index}
                  data={{
                    title: item.cohort.name,
                  }}
                  containerStyle={{
                    background: '#FFF4DC',
                  }}
                  width={['70%', '68%', '70%', '50%']}
                  rightItemHandler={(
                    <Button
                      color="blue.default"
                      borderColor="blue.default"
                      textTransform="uppercase"
                      onClick={() => {
                        acceptInvite({ id });
                      }}
                      gridGap="8px"
                    >
                      <Text color="blue.default" size="15px">
                        {t('invite.accept')}
                      </Text>
                    </Button>
                  )}
                />
              );
            })}

            {!isLoading && dataQuery?.cohorts <= 0 ? (
              <Flex flexDirection="column" gridGap="12px" background={featuredColor} padding="14px 20px 14px 20px" borderRadius="9px" border="1px solid" borderColor={borderColor}>
                <Heading size="sm" lineHeight="31px">
                  {t('not-enrolled')}
                </Heading>
                <Text size="md" fontWeight={600}>
                  {t('enroll-programs')}
                </Text>
                <Button variant="default" textransform="uppercase" width="fit-content">Enroll now</Button>
              </Flex>
            ) : (
              <NextChakraLink variant="buttonDefault" href="https://4geeksacademy.slack.com/" target="blank" rel="noopener noreferrer" display="flex" gridGap="10px" width="fit-content" padding="0.5rem 6px 0.5rem 8px">
                {t('join-our-community')}
                <Icon icon="slack" width="20px" height="20px" color="currentColor" />
              </NextChakraLink>
            )}
          </Box>
          <Box flex={{ base: 1, md: 0.3 }} zIndex={2} position={{ base: 'inherit', md: 'absolute' }} right={0} top={0}>
            {events?.length > 0 && (
              <LiveEvent
                liveUrl={events[0].url}
                liveStartsAt={new Date(events[0].starting_at)}
                liveEndsAt={new Date(events[0].ending_at)}
                otherEvents={events.slice(1)}
                // featureLabel,
              />
            )}
          </Box>
        </Flex>

        <Box>
          <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} margin="2rem  0 3rem 0" alignItems="center" gridGap={{ base: '4px', md: '10px' }}>
            <Heading size="sm" width={{ base: '100%', md: '22rem' }}>
              {t('your-active-programs')}
            </Heading>
            <Box as="hr" width="100%" margin="0.5rem 0 0 0" />
          </Box>
          {!isLoading && dataQuery.cohorts.length > 0 && (
            <ChooseProgram chooseList={dataQuery.cohorts} handleChoose={handleChoose} />
          )}
        </Box>
        {isLoading && dataQuery?.cohorts?.length > 0 && (
          <Box
            display="grid"
            mt="1rem"
            gridTemplateColumns="repeat(auto-fill, minmax(14rem, 1fr))"
            gridColumnGap="5rem"
            gridRowGap="3rem"
            height="auto"
          >
            {Array(3).fill(0).map((_, i) => (
              <Skeleton
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                startColor={commonStartColor}
                endColor={commonEndColor}
                width="100%"
                height="286px"
                color="white"
                borderRadius="17px"
              />
            ))}
          </Box>
        )}
      </GridContainer>
      {/* <Box
        fontWeight={400}
        width={['70%', '68%', '70%', '50%']}
        fontSize="14px"
        color={useColorModeValue('gray.600', 'gray.200')}
        letterSpacing="0.05em"
        marginBottom="49px"
        marginTop="36px"
      >
        {t('description')}
      </Box>
      {!loader.addmission && data.length > 0 && (
        <ChooseProgram chooseList={data} handleChoose={handleChoose} />
      )}
      {!loader.addmission && data.length <= 0 && (
        <Box background={featuredColor} padding="14 20px 14px 20px">
          <Heading size="sm" lineHeight="31px">
            You are not enrolled in any cohort
          </Heading>
        </Box>
      )}
      {loader.addmission && (
        <Box>
          Loading...
        </Box>
      )} */}
    </Flex>
  );
}

export default asPrivate(chooseProgram);

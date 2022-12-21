import React, { useEffect, useState } from 'react';
import {
  Flex, Box, useColorModeValue, Button, useToast,
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
import AlertMessage from '../../common/components/AlertMessage';
import useLocalStorageQuery from '../../common/hooks/useLocalStorageQuery';

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
  const [data, setData] = useState([]);
  const [invites, setInvites] = useState([]);
  const [showInvites, setShowInvites] = useState(false);
  const { user, choose } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const fetchAdmissions = () => bc.admissions().me();

  const { isLoading, error, isFetching, data: dataQuery } = useLocalStorageQuery(
    'admissions',
    fetchAdmissions,
    {
      // cache 1 hour
      cacheTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
    },
    true,
    // ''
  );

  useEffect(() => {
    console.log('loading: ', isLoading, 'isFetching:::', isFetching);
    console.log(dataQuery);

    if (error) console.log('Error fetching data: ', error);
    if (dataQuery) {
      setData(dataQuery?.cohorts);
      setProfile(dataQuery);
    }
    // if (isLoading) console.log('Loading data...');
    // if (error) console.log('Error fetching data: ', error);
    // if (dataQuery?.data && !isLoading) {
    //   console.log('dataQuery: ', dataQuery);
    //   setData(dataQuery?.data?.cohorts);
    //   setProfile(dataQuery.data);
    // }
  }, [dataQuery, isLoading]);

  const userID = user?.id;

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
    <Flex alignItems="center" flexDirection="column">
      {process.env.NODE_ENV === 'development' && (
        <Box margin="25px 0 0 0" display="flex" alignItems="center" justifyContent="space-between" width={['70%', '68%', '70%', '50%']}>
          <AlertMessage
            message={t('roles-info')}
            type="info"
            textColor={useColorModeValue('black', 'white')}
            style={{
              width: '100%',
            }}
          />
        </Box>
      )}
      <Heading
        fontWeight={800}
        size="xl"
        width={['70%', '68%', '70%', '50%']}
        // fontSize="50px"
        marginTop="40px"
      >
        {t('title')}
      </Heading>

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

      <Box
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
      <ChooseProgram chooseList={data} handleChoose={handleChoose} />
    </Flex>
  );
}

export default asPrivate(chooseProgram);

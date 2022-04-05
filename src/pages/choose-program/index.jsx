import React, { useEffect, useState } from 'react';
import {
  Flex, Box, useColorModeValue, Button, useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import ChooseProgram from '../../js_modules/chooseProgram';
import Text from '../../common/components/Text';
import bc from '../../common/services/breathecode';
import asPrivate from '../../common/context/PrivateRouteWrapper';
import useAuth from '../../common/hooks/useAuth';
import Icon from '../../common/components/Icon';
import Module from '../../common/components/Module';
import { isPlural } from '../../utils';
import Heading from '../../common/components/Heading';

function chooseProgram() {
  const [data, setData] = useState([]);
  const [invites, setInvites] = useState([]);
  const [showInvites, setShowInvites] = useState(false);
  const { choose } = useAuth();
  const router = useRouter();
  const toast = useToast();
  useEffect(() => {
    bc.admissions().me().then((res) => {
      const { cohorts } = res.data;
      setData(cohorts);
    });

    bc.auth().invites().get().then((res) => {
      setInvites(res.data);
    });
  }, []);

  const acceptInvite = ({ id }) => {
    bc.auth().invites().accept(id).then((res) => {
      const cohortName = res.data[0].cohort.name;
      toast({
        title: `Cohort ${cohortName} successfully accepted!`,
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
      return `${invites.length} new cohort invitations`;
    }
    return `${invites.length} new cohort invitation`;
  };

  const handleChoose = (cohort) => {
    choose(cohort);
  };

  return (
    <Flex alignItems="center" flexDirection="column">
      <Heading
        fontWeight={800}
        size="xl"
        width={['70%', '68%', '70%', '50%']}
        // fontSize="50px"
        marginTop="40px"
      >
        Your programs
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
            {`Ey! There are ${inviteWord()} for you to accept.`}
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
              {`${showInvites ? 'hide' : 'show'} invites`}
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
                textTransform="uppercase"
                onClick={() => {
                  acceptInvite({ id });
                }}
                background="white"
                border="1px solid #0097CD"
                gridGap="8px"
              >
                <Text color="blue.default" size="15px">
                  Accept
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
        Some Box here as an example to see how it will all look together. more random Box
        because we needed a bigger example. 4Geeks Academy is a great school that gives you
        great tool and teachers for you to learn all about how computers work!
      </Box>
      <ChooseProgram chooseList={data} handleChoose={handleChoose} />
    </Flex>
  );
}

export default asPrivate(chooseProgram);

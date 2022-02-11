import React, { useEffect, useState } from 'react';
import { Flex, Box, useColorModeValue } from '@chakra-ui/react';
import ChooseProgram from '../common/components/Choose';
import bc from '../common/services/breathecode';
import asPrivate from '../common/context/PrivateRouteWrapper';
import useAuth from '../common/hooks/useAuth';

function chooseProgram() {
  const [data, setData] = useState([]);
  const { choose } = useAuth();
  useEffect(() => {
    bc.admissions().me().then((res) => {
      const { cohorts } = res.data;
      setData(cohorts);
    });
  }, []);

  const handleChoose = (cohort) => {
    choose(cohort);
  };

  return (
    <Flex alignItems="center" flexDirection="column">
      <Box fontWeight={800} width={['70%', '68%', '56%', '50%']} fontSize={['40px', '50px', '55px', '70px']} marginTop="90px">Your programs</Box>
      <Box fontWeight={400} width={['70%', '68%', '56%', '50%']} fontSize={['10px', '15px', '15px', '20px']} color={useColorModeValue('gray.600', 'gray.200')} letterSpacing="0.05em" marginBottom="49px" marginTop="36px">Some Box here as an example to see how it will all look together. more random Box because we needed a bigger example. 4Geeks Academy is a great school that gives you great tool and teachers for you to learn all about how computers work!</Box>
      <ChooseProgram chooseList={data} handleChoose={handleChoose} />
    </Flex>
  );
}

export default asPrivate(chooseProgram);

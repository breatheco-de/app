import React from 'react';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import { Flex, Box } from '@chakra-ui/react';

function Choose() {
  return (
    <Flex alignItems="center" flexDirection="column">
      <Box fontWeight={800} width={['70%', '68%', '56%', '50%']} fontSize={['40px', '50px', '55px', '70px']} marginTop="90px">Your programs</Box>
      <Box fontWeight={400} width={['70%', '68%', '56%', '50%']} fontSize={['10px', '15px', '15px', '20px']} color="gray.600" marginBottom="49px" marginTop="36px">Some Box here as an example to see how it will all look together. more random Box because we needed a bigger example. 4Geeks Academy is a great school that gives you great tool and teachers for you to learn all about how computers work!</Box>
      <Box
        marginBottom="22px"
        display="flex"
        justifyContent="space-between"
        flexDirection="row"
        borderRadius="25px"
        height={['40px', '70px', '80px', '80px']}
        width={['70%', '68%', '56%', '50%']}
        border="lightgray solid 2px"
        fontSize={['12px', '13px', '14px', '15px', '15px']}
      >
        <Box display="flex" flexDirection="column" marginLeft="25px">
          <Box color="gray.700" marginLeft="20px" fontWeight="800" margin="0px" marginTop="15px">
            PRE WORK
          </Box>
          <Box color="gray.700" sans-serif marginLeft="20px" marginRight="30px" margin="0px">
            Cohort: Miami Prework
          </Box>
        </Box>
        <Box fontSize={['10px', '15px', '15px', '20px']} margin="0px" color="blue.400" fontWeight="800" justifyContent="center" alignContent="center" alignItem="center" marginRight="15px">
          Launch this program
          <ArrowForwardIcon color="blue.400" height={['40px', '70px', '80px', '80px']} width="40px" />
        </Box>
      </Box>
      <Box
        marginBottom="22px"
        display="flex"
        justifyContent="space-between"
        flexDirection="row"
        borderRadius="25px"
        height={['40px', '70px', '80px', '80px']}
        width={['70%', '68%', '56%', '50%']}
        border="lightgray solid 2px"
        fontSize={['12px', '13px', '14px', '15px', '15px']}
      >
        <Box display="flex" flexDirection="column" marginLeft="25px">
          <Box color="gray.700" marginLeft="20px" fontWeight="800" margin="0px" marginTop="15px">
            PRE WORK
          </Box>
          <Box color="gray.700" sans-serif marginLeft="20px" marginRight="30px" margin="0px">
            Cohort: Miami Prework
          </Box>
        </Box>
        <Box fontSize={['10px', '15px', '15px', '20px']} margin="0px" color="blue.400" fontWeight="800" justifyContent="center" alignContent="center" alignItem="center" marginRight="15px">
          Launch this program
          <ArrowForwardIcon color="blue.400" height={['40px', '70px', '80px', '80px']} width="40px" />
        </Box>
      </Box>
      <Box
        marginBottom="22px"
        display="flex"
        justifyContent="space-between"
        flexDirection="row"
        borderRadius="25px"
        height={['40px', '70px', '80px', '80px']}
        width={['70%', '68%', '56%', '50%']}
        border="lightgray solid 2px"
        fontSize={['12px', '13px', '14px', '15px', '15px']}
      >
        <Box display="flex" flexDirection="column" marginLeft="25px">
          <Box color="gray.700" marginLeft="20px" fontWeight="800" margin="0px" marginTop="15px">
            PRE WORK
          </Box>
          <Box color="gray.700" sans-serif marginLeft="20px" marginRight="30px" margin="0px">
            Cohort: Miami Prework
          </Box>
        </Box>
        <Box fontSize={['10px', '15px', '15px', '20px']} margin="0px" color="blue.400" fontWeight="800" justifyContent="center" alignContent="center" alignItem="center" marginRight="15px">
          Launch this program
          <ArrowForwardIcon color="blue.400" height={['40px', '70px', '80px', '80px']} width="40px" />
        </Box>
      </Box>
    </Flex>
  );
}

export default Choose;

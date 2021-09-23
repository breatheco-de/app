import React from 'react';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import { Flex, Text } from '@chakra-ui/react';

function Choose() {
  return (
    <Flex alignItems="center" flexDirection="column">
      <Text fontWeight={800} width={['70%', '68%', '56%', '50%']} fontSize={['40px', '50px', '55px', '70px']}>Your programs</Text>
      <Text fontWeight='600' width={['70%', '68%', '56%', '50%']} fontSize={['10px', '15px', '15px', '20px']} color='gray.600'>Some text here as an example to see how it will all look together. more random text because we needed a bigger example. 4Geeks Academy is a great school that gives you great tool and teachers for you to learn all about how computers work!</Text>
      <Text
        display='flex'
        justifyContent='space-between'
        flexDirection='row'
        borderRadius='25px'
        height={['40px', '70px', '80px', '80px']}
        width={['70%', '68%', '56%', '50%']}
        border='lightgray solid 2px'
        fontSize={['12px', '13px', '14px', '15px', '15px']}
      >
        <Text display='flex' flexDirection='column' marginLeft='25px'>
          <Text color={'gray.700'} marginLeft='20px' fontWeight='800' margin='0px'>
            PRE WORK
          </Text>
          <Text color={'gray.700'} sans-serif marginLeft='20px' marginRight='30px' margin='0px'>
            Cohort: Miami Prework
          </Text>
        </Text>
        <Text fontSize={['10px', '15px', '15px', '20px']} margin='0px' color='blue.400' fontWeight='800' justifyContent:center alignContent:center alignItem:center marginRight='15px'>
          Launch this program
          <ArrowForwardIcon color={'blue.400'} height={['40px', '70px', '80px', '80px']} width='40px' />
        </Text>
      </Text>
    </Flex>
  );
}

export default Choose;
import React from 'react'
import { ArrowForwardIcon } from '@chakra-ui/icons'
import { Flex, Text } from '@chakra-ui/react'

function Choose() {
    return (
        <Flex height="20vw" alignItems="center" justifyContent="" flexDirection="column" fontWeight="800">
            <Text fontSize="6xl" >Your programs</Text>
            <p>Some text here as an example to see how it will all look together.</p>
            <div flexDirection="row">
                <div>
                    PREWORK
                </div>
                <div>
                    Cohort: Miami Prework
                </div>
                <div fontColor={'blue.400'}>
                    Launch this program <ArrowForwardIcon color={'blue.400'} w={5}/>
                </div>
            </div>
        </Flex>
    )
}

export default Choose

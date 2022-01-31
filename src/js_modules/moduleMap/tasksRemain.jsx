import { Fragment } from 'react';
import {
  Box, useColorModeValue, Accordion, AccordionItem,
  AccordionButton, AccordionPanel, Skeleton, Button,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Heading from '../../common/components/Heading';
import Icon from '../../common/components/Icon';
import Text from '../../common/components/Text';

const TaskRemain = ({ sortedAssignments }) => {
  console.log('test');
  const filteredAssignments = sortedAssignments.filter(
    (el) => el.filteredModules.length !== el.modules.length,
  );

  const commonStartColor = useColorModeValue('gray.300', 'gray.light');
  const commonEndColor = useColorModeValue('gray.400', 'gray.400');

  console.log('sortedAssignments:::', sortedAssignments);
  console.log('filteredAssignments:::', filteredAssignments);
  return (
    <Accordion
      allowMultiple
      borderRadius="3px"
      border="2px solid"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
    >
      <AccordionItem border="0">
        <AccordionButton id="lessons_remain" borderBottom="2px solid" borderColor={useColorModeValue('gray.200', 'gray.700')}>
          <Box fontSize="20px" fontWeight="900" flex="1" textAlign="left">
            Lessons remain:
          </Box>
          <Icon icon="arrowDown" width="28px" />
        </AccordionButton>
        <AccordionPanel pb={4}>
          {filteredAssignments.length > 0 ? (
            <Accordion
              allowMultiple
              borderRadius="3px"
              border="2px solid"
              borderLeft="0"
              borderRight="0"
              borderTop="0"
              borderColor={useColorModeValue('gray.200', 'gray.700')}
            >
              {filteredAssignments.map((assignment, i) => {
                const index = i;
                const {
                  label, modules, description,
                } = assignment;

                return (
                  <Fragment key={index}>
                    <AccordionItem border="0">
                      <AccordionButton
                        display="flex"
                        alignItems="center"
                        padding="14px"
                        justifyContent="space-between"
                        borderTop="2px solid"
                        borderColor={useColorModeValue('gray.200', 'gray.700')}
                      >
                        <Heading as="h2" fontSize="16px">
                          {label}
                        </Heading>
                        <Heading
                          as="span"
                          fontSize="14px"
                          color={useColorModeValue('gray.default', 'white')}
                          fontWeight="normal"
                        >
                          {modules.length}
                          {' '}
                          Lessons
                        </Heading>
                      </AccordionButton>
                      <AccordionPanel pb={4}>
                        <Text letterSpacing="0.05em" size="16px">
                          {description}
                        </Text>
                        <Box width="100%" textAlign="right" margin="20px 0 10px 0">
                          <Button
                            fontSize="14px"
                            background="blue.default"
                            color="white"
                            fontWeight="900"
                            flex="1"
                            textAlign="center"
                            _hover={{
                              background: 'blue.600',
                            }}
                          >
                            Start module
                          </Button>
                        </Box>
                      </AccordionPanel>
                    </AccordionItem>
                  </Fragment>
                );
              })}
            </Accordion>
          ) : (
            <Skeleton
              startColor={commonStartColor}
              endColor={commonEndColor}
              height="38px"
              color="white"
              borderRadius="10px"
              width="100%"
              mt="6"
            />
          )}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

TaskRemain.propTypes = {
  sortedAssignments: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default TaskRemain;

import { Fragment } from 'react';
import {
  Box, useColorModeValue, Accordion, AccordionItem,
  AccordionButton, AccordionPanel, Skeleton, Button, useToast,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Heading from '../../common/components/Heading';
import Icon from '../../common/components/Icon';
import Text from '../../common/components/Text';

const TasksRemain = ({
  userId, sortedAssignments, startDay, contextState, setContextState,
}) => {
  const commonStartColor = useColorModeValue('gray.300', 'gray.light');
  const commonEndColor = useColorModeValue('gray.400', 'gray.400');
  const commonBorderColor = useColorModeValue('gray.200', 'gray.700');
  const modulesLengthColor = useColorModeValue('gray.default', 'white');
  const toast = useToast();
  const filteredAssignments = (sortedAssignments.length >= 1 ? sortedAssignments : []).filter(
    (el) => el.filteredModules.length !== el.modules.length,
  );

  const handleStartDay = (data) => {
    const { modules, label } = data;
    const updatedTasks = (modules || [])?.map((l) => ({
      ...l,
      associated_slug: l.slug,
    }));

    startDay({
      id: userId,
      newTasks: updatedTasks,
      label,
      contextState,
      setContextState,
      toast,
    });
  };

  const NoTaskRemain = () => {
    if (filteredAssignments.length === 0) {
      return <Box>No modules remain</Box>;
    }
    return (
      <Skeleton
        startColor={commonStartColor}
        endColor={commonEndColor}
        height="38px"
        color="white"
        borderRadius="10px"
        width="100%"
        mt="6"
      />
    );
  };

  return (
    <Accordion
      allowMultiple
      borderRadius="3px"
      border="2px solid"
      borderColor={commonBorderColor}
    >
      <AccordionItem border="0">
        <AccordionButton borderBottom="2px solid" borderColor={commonBorderColor}>
          <Box id="tasks_remain" fontSize="20px" fontWeight="900" flex="1" textAlign="left">
            Modules remain:
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
              borderColor={commonBorderColor}
            >
              {filteredAssignments.map((assignment, i) => {
                const index = i;
                const {
                  id, label, modules, description,
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
                        borderColor={commonBorderColor}
                      >
                        <Box flex="1" display="flex" gridGap="20px">
                          <Heading as="span" fontSize="14spx" fontWeight="500">
                            {id}
                          </Heading>
                          <Heading as="h2" fontSize="16px">
                            {label}
                          </Heading>

                        </Box>
                        <Heading
                          as="span"
                          fontSize="14px"
                          color={modulesLengthColor}
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
                            onClick={() => handleStartDay({ modules, label })}
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
            <NoTaskRemain />
          )}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

TasksRemain.propTypes = {
  userId: PropTypes.number.isRequired,
  sortedAssignments: PropTypes.arrayOf(PropTypes.any).isRequired,
  startDay: PropTypes.func.isRequired,
  contextState: PropTypes.objectOf(PropTypes.any).isRequired,
  setContextState: PropTypes.func.isRequired,
};

export default TasksRemain;

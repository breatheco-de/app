import React, { useState } from 'react';
import PropTypes from 'prop-types';
// import { useRouter } from 'next/router';
// import axios from '../../axios';
import { Box } from '@chakra-ui/react';

import Icon from '../../common/components/Icon';
import Text from '../../common/components/Text';
import ProgramList from './programList';

function ChooseProgram({ chooseList, handleChoose }) {
  const [showFinished, setShowFinished] = useState(false);

  const activeCohorts = chooseList.filter((program) => {
    const showCohort = [
      'PREWORK',
      'STARTED',
      'ACTIVE',
      'FINAL_PROJECT',
    ].includes(program.cohort.stage);
    const showStudent = ['ACTIVE'].includes(program.educational_status)
        && program.role === 'STUDENT';
    return showCohort || showStudent;
  });
  const finishedCohorts = chooseList.filter((program) => {
    const showCohort = ['ENDED'].includes(program.cohort.stage);
    const showStudent = ['GRADUATED', 'POSPONED'].includes(
      program.educational_status,
    );
    return program.role !== 'STUDENT' || (showCohort && showStudent);
  });

  return (
    <>
      {activeCohorts.length > 0 && (
        <Box
          display="flex"
          justifyContent="space-between"
          flexDirection="column"
          borderRadius="25px"
          height="100%"
          // padding="22px 12px 22px 22px"
          width={['70%', '68%', '70%', '50%']}
          gridGap="2px"
        >
          {activeCohorts.map((item, i) => {
            const index = i;
            return (
              <ProgramList
                key={index}
                item={item}
                handleChoose={handleChoose}
              />
            );
          })}
        </Box>
      )}

      {
        finishedCohorts.length > 0 && (
          <>
            <Text
              width={['70%', '68%', '70%', '50%']}
              display="flex"
              padding="25px 0"
              flexDirection="row"
              gridGap="6px"
              size="md"
            >
              {`There are ${finishedCohorts.length} programs you have already finished.`}
              <Text
                as="button"
                size="md"
                fontWeight="bold"
                textAlign="left"
                gridGap="10px"
                _focus={{
                  boxShadow: '0 0 0 3px rgb(66 153 225 / 60%)',
                }}
                color="blue.default"
                display="flex"
                alignItems="center"
                onClick={() => setShowFinished(!showFinished)}
              >
                {`click here to ${showFinished ? 'hide' : 'display'} them`}
                <Icon
                  icon="arrowDown"
                  width="20px"
                  height="20px"
                  style={{ transform: showFinished ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </Text>
            </Text>
            <Box
              display="flex"
              justifyContent="space-between"
              flexDirection="column"
              borderRadius="25px"
              height="100%"
              // padding="22px 12px 22px 22px"
              width={['70%', '68%', '70%', '50%']}
              gridGap="2px"
            >
              {showFinished && finishedCohorts.map((item, i) => {
                const index = i;
                return (
                  <ProgramList
                    key={index}
                    item={item}
                    handleChoose={handleChoose}
                  />
                );
              })}
            </Box>
          </>
        )
      }
    </>
  );
}

ChooseProgram.propTypes = {
  chooseList: PropTypes.arrayOf(PropTypes.object),
  handleChoose: PropTypes.func,
};
ChooseProgram.defaultProps = {
  chooseList: [],
  handleChoose: () => {},
};

export default ChooseProgram;

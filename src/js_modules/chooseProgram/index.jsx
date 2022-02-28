import React, { useState } from 'react';
import PropTypes from 'prop-types';
// import { useRouter } from 'next/router';
// import axios from '../../axios';

import Icon from '../../common/components/Icon';
import Text from '../../common/components/Text';
import ProgramList from './programList';

function ChooseProgram({ chooseList, handleChoose }) {
  const [showFinished, setShowFinished] = useState(false);

  const programsFinished = chooseList.filter(((program) => {
    if (program.educational_status === 'GRADUATED' || program.cohort.stage === 'ENDED') {
      return true;
    }
    return false;
  }));

  const programsRemain = chooseList.filter(((program) => {
    if (program.cohort.stage !== 'ENDED') {
      return true;
    }
    return false;
  }));

  return (
    <>
      {programsRemain.length > 0 && programsRemain.map((item, i) => {
        const index = i;
        return (
          <ProgramList
            key={index}
            item={item}
            handleChoose={handleChoose}
          />
        );
      })}

      {
        programsFinished.length > 0 && (
          <>
            <Text
              width={['70%', '68%', '56%', '50%']}
              display="flex"
              padding="25px 0"
              flexDirection="row"
              gridGap="6px"
              size="md"
            >
              {`There are ${programsFinished.length} programs you have already finished.`}
              <Text
                as="button"
                size="md"
                _focus={{
                  boxShadow: '0 0 0 3px rgb(66 153 225 / 60%)',
                }}
                color="blue.default"
                display="flex"
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
            {showFinished && programsFinished.map((item, i) => {
              const index = i;
              return (
                <ProgramList
                  key={index}
                  item={item}
                  handleChoose={handleChoose}
                />
              );
            })}
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

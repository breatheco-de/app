import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import { Box } from '@chakra-ui/react';
import Icon from '../../common/components/Icon';
import { isPlural } from '../../utils';
import Text from '../../common/components/Text';
import ProgramList from './programList';
import useOnline from '../../common/hooks/useOnline';

function ChooseProgram({ chooseList, handleChoose }) {
  const { t } = useTranslation('choose-program');
  const { usersConnected } = useOnline();
  const [showFinished, setShowFinished] = useState(false);

  const activeCohorts = chooseList.filter((program) => {
    const educationalStatus = program?.educational_status?.toUpperCase();
    const programRole = program?.role?.toUpperCase();
    const programCohortStage = program?.cohort?.stage?.toUpperCase();

    const includesPrework = ['PREWORK'].includes(programCohortStage);
    const visibleForTeacher = includesPrework && programRole !== 'STUDENT';

    const showCohort = [
      'STARTED',
      'ACTIVE',
      'FINAL_PROJECT',
    ].includes(programCohortStage);

    const showStudent = ['ACTIVE'].includes(educationalStatus)
      && !includesPrework
      && programRole === 'STUDENT';

    const show = visibleForTeacher || showCohort || showStudent;

    return show;
  });

  const finishedCohorts = chooseList.filter((program) => {
    const educationalStatus = program?.educational_status?.toUpperCase();
    const programCohortStage = program?.cohort?.stage?.toUpperCase();

    const showCohort = ['ENDED'].includes(programCohortStage);
    // ACTIVE: show be here because the student may not have delivered all the homework
    const showStudent = ['GRADUATED', 'POSTPONED', 'ACTIVE'].includes(
      educationalStatus,
    );
    return showCohort && showStudent;
  });

  return (
    <>
      {activeCohorts.length > 0 && (
        <Box
          display="grid"
          // justifyContent="space-between"
          gridTemplateColumns="repeat(auto-fill, minmax(14rem, 1fr))"
          // flexDirection="column"
          // borderRadius="25px"
          height="auto"
          // width={['70%', '68%', '70%', '50%']}
          gridGap="5rem"
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
            <Box
              // width={['100%', '78%', '70%', '80%']}
              display="flex"
              margin="2rem auto"
              // padding="25px 0"
              flexDirection={{ base: 'column', md: 'row' }}
              gridGap={{ base: '0', md: '6px' }}
              justifyContent="center"
            >
              <Text
                size="md"
              >
                {isPlural(finishedCohorts)
                  ? t('finished.plural', { finishedCohorts: finishedCohorts.length })
                  : t('finished.singular', { finishedCohorts: finishedCohorts.length })}
              </Text>
              <Text
                as="button"
                alignSelf="center"
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
                {showFinished ? t('finished.hide') : t('finished.show')}
                <Icon
                  icon="arrowDown"
                  width="20px"
                  height="20px"
                  style={{ transform: showFinished ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </Text>
            </Box>
            <Box
              display="grid"
              mt="1rem"
              gridTemplateColumns="repeat(auto-fill, minmax(14rem, 1fr))"
              gridGap="5rem"
              height="auto"
            >
              {showFinished && finishedCohorts.map((item, i) => {
                const index = i;
                return (
                  <ProgramList
                    usersConnected={usersConnected}
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

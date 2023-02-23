import React, { useState } from 'react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import { Box } from '@chakra-ui/react';
import Icon from '../../common/components/Icon';
import { isPlural } from '../../utils';
import Text from '../../common/components/Text';
import useOnline from '../../common/hooks/useOnline';
import handlers from '../../common/handlers';
import Programs from './Programs';

function ChooseProgram({ chooseList, handleChoose }) {
  const { t } = useTranslation('choose-program');
  const { usersConnected } = useOnline();
  const [showFinished, setShowFinished] = useState(false);

  const activeCohorts = handlers.getActiveCohorts(chooseList);
  const finishedCohorts = handlers.getCohortsFinished(chooseList);
  return (
    <>
      {activeCohorts.length > 0 && (
        <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fill, minmax(15rem, 1fr))"
          height="auto"
          gridGap="4rem"
        >
          {activeCohorts.map((item) => (
            <Programs
              key={item?.cohort?.slug}
              item={item}
              handleChoose={handleChoose}
              usersConnected={usersConnected}
            />
          ))}
        </Box>
      )}

      {
        finishedCohorts.length > 0 && (
          <>
            <Box
              display="flex"
              margin="2rem auto"
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
              gridColumnGap="5rem"
              gridRowGap="3rem"
              height="auto"
            >
              {showFinished && finishedCohorts.map((item) => (
                <Programs
                  key={item?.cohort?.slug}
                  item={item}
                  handleChoose={handleChoose}
                  usersConnected={usersConnected}
                />
              ))}
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

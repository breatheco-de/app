import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { calculateDifferenceDays } from '../../utils';

function ComponentOnTime({ startingAt, finishedView, idleView }) {
  const [justFinished, setJustFinished] = useState(false);

  useEffect(() => {
    let interval;
    if (justFinished === false) {
      interval = setInterval(() => {
        const startingAtDate = new Date(startingAt);
        const { isRemainingToExpire } = calculateDifferenceDays(startingAtDate);

        if (!isRemainingToExpire && !justFinished) {
          setJustFinished(true);
        }
      }, 1000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [justFinished]);

  return (
    <>
      {justFinished ? (
        finishedView
      ) : (
        idleView
      )}
    </>
  );
}

ComponentOnTime.propTypes = {
  startingAt: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  finishedView: PropTypes.node,
  idleView: PropTypes.node,
};

ComponentOnTime.defaultProps = {
  startingAt: null,
  finishedView: null,
  idleView: null,
};

export default ComponentOnTime;

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { calculateDifferenceDays } from '../utils';

function ComponentOnTime({ startingAt, endingAt, finishedView, idleView, onEndedEvent }) {
  const [justStarted, setJustStarted] = useState(false);
  const [justFinished, setJustFinished] = useState(false);

  useEffect(() => {
    let interval;
    if (!justStarted && !justFinished) {
      interval = setInterval(() => {
        const startingAtDate = new Date(startingAt);
        const endingAtDate = new Date(endingAt);
        const { isRemainingToExpire: remainingToStartedDate } = calculateDifferenceDays(startingAtDate);
        const { isRemainingToExpire: remainingToEndedAtDate } = calculateDifferenceDays(endingAtDate);

        if (!remainingToStartedDate) {
          setJustStarted(true);
        }
        if (!remainingToEndedAtDate) {
          setJustFinished(true);
          onEndedEvent();
        }
      }, 1000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [justStarted, justFinished]);

  return (
    <>
      {(justStarted && !justFinished) ? (
        finishedView
      ) : (
        idleView
      )}
    </>
  );
}

ComponentOnTime.propTypes = {
  startingAt: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  endingAt: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  finishedView: PropTypes.node,
  idleView: PropTypes.node,
  onEndedEvent: PropTypes.func,
};

ComponentOnTime.defaultProps = {
  startingAt: null,
  endingAt: null,
  finishedView: null,
  idleView: null,
  onEndedEvent: () => {},
};

export default ComponentOnTime;

/* eslint-disable @next/next/no-img-element */
/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-expressions */
import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import styles from '../../styles/beforeAfterSlider.module.css';

export function isIntersectionObserverSupport() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.IntersectionObserver);
}

const MODE = {
  MOVE: 'move',
  DEFAULT: 'default',
};

function useReadyStatus(
  imagesWidth,
  refContainer,
  onReady,
) {
  const [isReady, setIsReady] = useState(false);

  const [imagesLoadedCount, setImagesLoadedCount] = useState(0);
  const incrementLoadedImagesCount = () => {
    setImagesLoadedCount(imagesLoadedCount + 1);
  };

  useEffect(() => {
    if (!isReady && imagesLoadedCount === 2 && imagesWidth && refContainer.current) {
      setIsReady(true);
    }
  }, [imagesLoadedCount, imagesWidth, isReady, refContainer.current]);

  useEffect(() => {
    if (isReady && onReady) {
      onReady();
    }
  }, [isReady]);

  return {
    onImageLoad: incrementLoadedImagesCount,
    isReady,
  };
}

function useInit(updateContainerWidth, onMouseUpHandler) {
  useEffect(() => {
    updateContainerWidth();
    document.addEventListener('onmousemove', onMouseUpHandler);
    return () => {
      document.removeEventListener('onmousemove', onMouseUpHandler);
    };
  }, []);
}

function useResizeFeel(callback, withResizeFeel) {
  useEffect(() => {
    if (withResizeFeel) {
      window.addEventListener('resize', callback);
    }

    return () => {
      window.removeEventListener('resize', callback);
    };
  }, []);
}

function normalizeNewPosition(newPosition, imagesWidth) {
  if (newPosition > imagesWidth) {
    return imagesWidth;
  }
  if (newPosition < 0) {
    return 0;
  }

  return newPosition;
}

const DEFAULT_START_PERSENT = 50;

// interface Props {
//     firstImage: Image,
//     secondImage: Image,
//     currentPercentPosition?: number,
//     className?: string,
//     withResizeFeel?: boolean,
//     onReady?: OnSliderLoadCallback,
//     onVisible?: () => void,
//     onChangePercentPosition?: (newPosition: number) => void,
//     delimiterColor?: string,
// }
export default function BeforeAfterSlider({
  firstImage,
  secondImage,
  className,
  withResizeFeel = true,
  currentPercentPosition,
  onVisible,
  onReady,
  onChangePercentPosition,
  delimiterColor,
  // aspectRatio,
}) {
  const classNames = ['before-after-slider'];
  className && classNames.push(className);

  const refContainer = useRef(null);
  const [imagesWidth, setImagesWidth] = useState(null);
  const [delimerPercentPosition, setDelimerPosition] = useState(
    currentPercentPosition
    || DEFAULT_START_PERSENT,
  );
  const [sliderMode, setSliderMode] = useState(MODE.DEFAULT);
  const { onImageLoad, isReady } = useReadyStatus(imagesWidth, refContainer, onReady);
  const [containerPosition, setContainerPosition] = useState({
    top: 0,
    left: 0,
  });
  /**
   * Observer start
   */
  const observerVisiblePersent = 0.95;
  const observerOptions = {
    threshold: [0.0, observerVisiblePersent],
  };
  const observerCallback = (entries) => {
    if (!observer || !onVisible) return;
    entries.forEach((entry) => {
      if (entry.intersectionRatio > observerVisiblePersent) {
        observer.disconnect();
        onVisible();
      }
    });
  };
  const [observer] = useState(
    onVisible && isIntersectionObserverSupport()
      ? new IntersectionObserver(observerCallback, observerOptions)
      : null,
  );
  useEffect(() => {
    if (observer) {
      if (!isReady) return;
      observer.observe(refContainer.current);
    }
  }, [isReady]);
  /**
   * Observer end
   */

  useEffect(() => {
    if (!currentPercentPosition || !imagesWidth) {
      return;
    }
    setDelimerPosition(normalizeNewPosition(currentPercentPosition, imagesWidth));
  }, [currentPercentPosition, imagesWidth]);

  const updateContainerWidth = () => {
    if (!refContainer.current) return;
    const containerWidth = refContainer.current.offsetWidth;
    setImagesWidth(containerWidth);
  };

  const onMouseUpHandler = () => {
    setSliderMode(MODE.DEFAULT);
  };

  useInit(updateContainerWidth, onMouseUpHandler);

  const imgStyles = !imagesWidth ? undefined : {
    width: `${imagesWidth}px`,
    height: '100%',
    maxWidth: 'none',
    // aspectRatio,
    backgroundColor: '#000',
  };
  const secondImgContainerStyle = { width: `${delimerPercentPosition}%` };
  const delimiterIconStyles = {
    backgroundColor: delimiterColor,
  };
  const delimiterPositionStyle = {
    left: `${delimerPercentPosition}%`,
    backgroundColor: delimiterColor,
  };

  const updateContainerPosition = () => {
    if (!refContainer.current) return;
    const containerCoords = refContainer.current.getBoundingClientRect();

    setContainerPosition({
      top: containerCoords.top + window.pageYOffset,
      left: containerCoords.left + window.pageXOffset,
    });
  };

  const onMouseDownHandler = () => {
    updateContainerPosition();
    setSliderMode(MODE.MOVE);
  };

  const onMoveHandler = (e) => {
    if (sliderMode === MODE.MOVE) {
      if (!imagesWidth) return;
      const X = e.pageX - containerPosition.left;
      const newPosition = (normalizeNewPosition(X, imagesWidth) / imagesWidth) * 100;
      onChangePercentPosition
        ? onChangePercentPosition(newPosition)
        : setDelimerPosition(newPosition);
    }
  };

  const onMouseMoveHandler = (e) => onMoveHandler(e);

  const onTouchMoveHandler = (e) => {
    onMoveHandler(e.touches[0]);
  };

  useResizeFeel(updateContainerWidth, withResizeFeel);
  return (
    <Box
      as="div"
      ref={refContainer}
      id="beforeAfterSliderContainer"
      className={styles['before-after-slider'] || classNames.join(' ')}
      onMouseDown={onMouseDownHandler}
      onMouseMove={onMouseMoveHandler}
      onTouchStart={onMouseDownHandler}
      onTouchMove={onTouchMoveHandler}
    >
      <img
        src={secondImage}
        alt="width_calc"
        className={styles['before-after-slider__size-fix-img']}
        onLoad={updateContainerWidth}
        style={{
          // aspectRatio,
          height: '100%',
        }}
      />
      {Boolean(imagesWidth) && (
        <>
          <Box className={styles['before-after-slider__first-photo-container']}>
            <img
              src={secondImage}
              style={imgStyles}
              onLoad={onImageLoad}
              draggable={false}
              alt="before_image"
            />
          </Box>
          <Box className={styles['before-after-slider__second-photo-container']} style={secondImgContainerStyle}>
            <img
              src={firstImage}
              style={imgStyles}
              onLoad={onImageLoad}
              draggable={false}
              alt="after_image"
            />
          </Box>
          <div className={styles['before-after-slider__delimiter']} style={delimiterPositionStyle}>
            <div>
              <div className={styles['before-after-slider__delimiter-icon']} style={delimiterIconStyles} />
            </div>
          </div>
        </>
      )}
    </Box>
  );
}
BeforeAfterSlider.propTypes = {
  firstImage: PropTypes.string.isRequired,
  secondImage: PropTypes.string.isRequired,
  className: PropTypes.string,
  withResizeFeel: PropTypes.bool,
  currentPercentPosition: PropTypes.number,
  onVisible: PropTypes.func,
  onReady: PropTypes.func,
  onChangePercentPosition: PropTypes.func,
  delimiterColor: PropTypes.string,
  // aspectRatio: PropTypes.string,
};

BeforeAfterSlider.defaultProps = {
  className: undefined,
  withResizeFeel: true,
  currentPercentPosition: undefined,
  onVisible: undefined,
  onReady: undefined,
  onChangePercentPosition: undefined,
  delimiterColor: '#0097CD',
  // aspectRatio: '16/9',
};

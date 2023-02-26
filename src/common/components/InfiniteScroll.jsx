import PropTypes from 'prop-types';
import React, { useRef, useCallback, useEffect } from 'react';

function InfiniteScroll({ data, renderItem, loadMore, hasMore, children }) {
  const observer = useRef();
  const childrenRef = useRef(null);

  const lastItemRef = useCallback(
    (node) => {
      if (!children) {
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting && hasMore) {
            loadMore(data.length / 20 + 1); // Carga la siguiente página de datos
          }
        });
        if (node) observer.current.observe(node);
      }
    },
    [data.length, hasMore, loadMore],
  );

  const handleObserver = (entities) => {
    const target = entities[0];
    if (target.isIntersecting && hasMore) {
      loadMore();
    }
  };

  useEffect(() => {
    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '0px',
      threshold: 1.0,
    });

    if (childrenRef.current) {
      observer.current.observe(childrenRef.current);
    }

    return () => {
      observer.current.disconnect();
    };
  }, [childrenRef, children]);

  return (
    <>
      {!renderItem
        ? React.cloneElement(children, { ref: childrenRef }, data)
        : (data.map((item, index) => {
          if (data.length === index + 1) {
          /*
            If this is the last element in the array, we put a reference to it so that
            the intersection look at the visibility and call the `loadMore` function.
          */
            return <div ref={lastItemRef}>{renderItem(item)}</div>;
          }
          return <div>{renderItem(item)}</div>;
        }))}
      <div ref={childrenRef} />
    </>
  );
}

InfiniteScroll.propTypes = {
  data: PropTypes.arrayOf(PropTypes.any).isRequired,
  renderItem: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  loadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.bool]),
};

InfiniteScroll.defaultProps = {
  children: false,
  renderItem: false,
};

export default InfiniteScroll;

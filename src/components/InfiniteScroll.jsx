import { Box, Link } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import React, { useRef, useCallback, useEffect } from 'react';
import { isWindow } from '../utils';

function InfiniteScroll({ data, renderItem, loadMore, hasMore, currentPage, pageCount, children }) {
  const observer = useRef();
  const childrenRef = useRef(null);
  const router = useRouter();
  const pathname = router?.pathname || (isWindow ? window?.location?.pathname : '');

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
      <Box textAlign="center" margin="4rem 0 0 0">
        {hasMore && (currentPage < pageCount) && (
          <Link
            variant="default"
            href={`${pathname}?page=${currentPage + 1}`}
            onClick={(e) => {
              e.preventDefault();
              loadMore();
              // router?.push(`${pathname}?page=${currentPage + 1}`);
            }}
          >
            Load more...
          </Link>
        )}
      </Box>
    </>
  );
}

InfiniteScroll.propTypes = {
  data: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  renderItem: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  loadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.bool]),
  currentPage: PropTypes.number,
  pageCount: PropTypes.number,
};

InfiniteScroll.defaultProps = {
  children: false,
  renderItem: false,
  currentPage: 1,
  pageCount: 0,
};

export default InfiniteScroll;

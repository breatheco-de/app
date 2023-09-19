import Head from 'next/head';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import React, { useState, useCallback, useMemo } from 'react';
import ProjectList from '../../js_modules/projects/ProjectList';
import { isWindow } from '../../utils';
import InfiniteScroll from './InfiniteScroll';
import { ORIGIN_HOST } from '../../utils/variables';

function ProjectsLoader({ articles, itemsPerPage, renderItem, searchQuery, options }) {
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const pagePath = options?.pagePath;
  const pathname = router?.pathname || (isWindow ? window?.location?.pathname : '');

  const articleChunks = useMemo(() => {
    const newArticleChunks = [];
    for (let i = 0; i < articles.length; i += itemsPerPage) {
      newArticleChunks.push(articles.slice(i, i + itemsPerPage));
    }
    return newArticleChunks;
  }, [articles, itemsPerPage]);

  const loadMore = useCallback(() => {
    setCurrentPage((prevPage) => prevPage + 1);
  }, []);
  const pageCount = Math.ceil(articles.length / itemsPerPage);

  const currentArticles = articleChunks.slice(0, currentPage).flat();
  const isSearching = searchQuery.length > 0;

  const hasMore = currentPage < articleChunks.length && !isSearching;

  return (
    <div>
      <Head>
        <link rel="canonical" href={`${ORIGIN_HOST}${pagePath}`} />
        {currentPage - 1 > 0 && (
          <link rel="prev" href={`${pathname}?page=${currentPage - 1}`} />
        )}
        {currentPage < pageCount && (
          <link rel="next" href={`${pathname}?page=${currentPage + 1}`} />
        )}
      </Head>
      {currentArticles.length > 0 && (
        <InfiniteScroll
          data={currentArticles}
          renderItem={renderItem}
          loadMore={loadMore}
          currentPage={currentPage}
          pageCount={pageCount}
          hasMore={hasMore}
        >
          <ProjectList
            projects={hasMore ? currentArticles : articles}
            {...options}
          />
        </InfiniteScroll>
      )}
    </div>
  );
}

ProjectsLoader.propTypes = {
  articles: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  renderItem: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  searchQuery: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
  options: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};

ProjectsLoader.defaultProps = {
  options: {},
  renderItem: false,
};

export default ProjectsLoader;

import PropTypes from 'prop-types';
import React, { useState, useCallback, useMemo } from 'react';
import ProjectList from '../../js_modules/projects/ProjectList';
import InfiniteScroll from './InfiniteScroll';

function ProjectsLoader({ articles, itemsPerPage, renderItem, searchQuery, options }) {
  const [currentPage, setCurrentPage] = useState(1);

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

  const currentArticles = articleChunks.slice(0, currentPage).flat();
  const isSearching = searchQuery.length > 0;

  const hasMore = currentPage < articleChunks.length && !isSearching;

  return (
    <div>
      {currentArticles.length > 0 && (
        <InfiniteScroll
          data={currentArticles}
          renderItem={renderItem}
          loadMore={loadMore}
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
  articles: PropTypes.arrayOf(PropTypes.any).isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  renderItem: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]).isRequired,
  searchQuery: PropTypes.string.isRequired,
  options: PropTypes.objectOf(PropTypes.any),
};

ProjectsLoader.defaultProps = {
  options: {},
};

export default ProjectsLoader;

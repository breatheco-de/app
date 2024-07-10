import Head from 'next/head';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import React, { useState, useCallback, useEffect } from 'react';
import ProjectList from '../../js_modules/projects/ProjectList';
import { isWindow } from '../../utils';
import InfiniteScroll from './InfiniteScroll';
import { ORIGIN_HOST } from '../../utils/variables';

function ProjectsLoader({ articles, itemsPerPage, renderItem, searchQuery, options, count, fetchData, lang, type }) {
  const router = useRouter();
  const { locales } = router;
  const [currentPage, setCurrentPage] = useState(router?.query?.page ? Number(router.query.page) : 1);
  const locationLang = {
    us: 'en',
    en: 'en',
    es: 'es',
  };

  const pagePath = options?.pagePath;
  const pathname = router?.pathname || (isWindow ? window?.location?.pathname : '');

  useEffect(() => {
    setCurrentPage(1);
  }, [router.query]);

  const loadMore = useCallback(async () => {
    const { data } = await fetchData(lang, currentPage + 1, router.query);
    const results = data?.results.map(
      (l) => ({ ...l, difficulty: l.difficulty?.toLowerCase() || null }),
    );
    articles.push(...results);
    setCurrentPage((prevPage) => prevPage + 1);
  }, [currentPage, articles]);
  const pageCount = Math.ceil(count / itemsPerPage);

  const isSearching = searchQuery.length > 0;

  const hasMore = articles.length < count && !isSearching;

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
        {locales.map((language) => (['default', 'en'].includes(language) ? (
          <React.Fragment key={`${language} - ${pathname}`}>
            <link rel="alternate" hrefLang="x-default" href={`https://4geeks.com${pathname}`} />
            <link rel="alternate" hrefLang={locationLang[language]} href={`https://4geeks.com${pathname}`} />
          </React.Fragment>
        ) : (
          <link key={`${language} - ${pathname} alternate`} rel="alternate" hrefLang={locationLang[language]} href={`https://4geeks.com/${language}${pathname}`} />
        )))}
      </Head>

      <InfiniteScroll
        data={articles}
        renderItem={renderItem}
        loadMore={loadMore}
        currentPage={currentPage}
        pageCount={pageCount}
        hasMore={hasMore}
      >
        <ProjectList
          projects={articles}
          type={type}
          {...options}
        />
      </InfiniteScroll>

    </div>
  );
}

ProjectsLoader.propTypes = {
  type: PropTypes.string.isRequired,
  articles: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  count: PropTypes.number.isRequired,
  fetchData: PropTypes.func.isRequired,
  lang: PropTypes.string.isRequired,
  renderItem: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  searchQuery: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
  options: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};

ProjectsLoader.defaultProps = {
  options: {},
  renderItem: false,
};

export default ProjectsLoader;

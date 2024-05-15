/* eslint-disable no-unsafe-optional-chaining */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Box } from '@chakra-ui/react';
import ProjectList from '../../../js_modules/projects/ProjectList';
import PageIndexes from './PageIndexes';
import { getQueryString, isNumber } from '../../../utils';
import { CardSkeleton } from '../Skeleton';
import { DOMAIN_NAME } from '../../../utils/variables';

function PaginatedView({ storyConfig, renderComponent, handlePageChange, queryFunction, options }) {
  const [data, setData] = useState([]);
  const [pageProps, setPageProps] = useState({});
  const router = useRouter();
  const { locales } = router;
  const locale = storyConfig?.locale || router?.locale || 'en';
  const page = storyConfig?.page || getQueryString('page', 1);

  const contentPerPage = options?.contentPerPage || 20;
  const listToTop = options?.listToTop || false;
  const listToBottom = options?.listToBottom || true;
  const pagePath = options?.pagePath || '/';
  const disableLangFilter = options?.disableLangFilter || false;
  const locationLang = {
    us: 'en',
    en: 'en',
    es: 'es',
  };
  const canonicalLang = {
    us: '',
    en: '',
    es: '/es',
  };

  const handlePaginationProps = async () => {
    const respData = await queryFunction();
    const pages = Math.ceil(respData.count / contentPerPage);
    // Generate an array of pages to be used in the pagination component e.g: `/lessons?page=2`
    const pagesArray = Array.from(Array(pages).keys()).map((item) => `${pagePath}?page=${item + 1}`);

    if (page) {
      setPageProps({
        pages,
        currentPage: parseInt(page, 10),
        pagesArray,
      });

      setData(respData);
    }
  };
  useEffect(() => {
    handlePaginationProps();
  }, [page, queryFunction]);

  const currentPageIndex = parseInt(page, 10);

  const getPageIndexes = () => {
    const pageIndexes = [];
    pageIndexes.push(currentPageIndex);
    if (currentPageIndex > 0) {
      pageIndexes.unshift(currentPageIndex - 1);
    }
    if (currentPageIndex < pageProps?.pagesArray?.length - 1) {
      pageIndexes.push(currentPageIndex + 1);
    }
    if (pageIndexes[0] > 0) {
      pageIndexes.unshift(0);
    }
    if (pageIndexes[pageIndexes.length - 1] < pageProps?.pagesArray?.length - 1) {
      pageIndexes.push(pageProps?.pagesArray?.length - 1);
    }
    return pageIndexes;
  };

  const pageIndexes = getPageIndexes();
  const nextPagePath = pageProps?.pagesArray?.[currentPageIndex];
  const currentPagePath = pageProps?.pagesArray?.[currentPageIndex - 1];
  const prevPagePath = pageProps?.pagesArray?.[currentPageIndex - 2];

  const indexPageExists = prevPagePath || nextPagePath;

  const langs = {
    en: 'en',
    us: 'en',
  };
  const resultsFilteredByLang = (!disableLangFilter && data?.results?.length > 0)
    ? data.results.filter(
      (asset) => (langs[asset?.lang] || asset?.lang) === locale,
    ) : data.results;

  return isNumber(pageProps?.currentPage) ? (
    <Box>
      <Head>
        <link rel="canonical" href={`${DOMAIN_NAME}${canonicalLang[router?.locale]}${pagePath}`} />
        {prevPagePath && (
          <link rel="prev" href={prevPagePath} />
        )}
        {nextPagePath && (
          <link rel="next" href={nextPagePath} />
        )}
        {locales.map((lang) => (['default', 'en'].includes(lang) ? (
          <React.Fragment key={`${lang} - ${currentPagePath}`}>
            <link rel="alternate" hrefLang="x-default" href={`https://4geeks.com${currentPagePath}`} />
            <link rel="alternate" hrefLang={locationLang[lang]} href={`https://4geeks.com${currentPagePath}`} />
          </React.Fragment>
        ) : (
          <link key={`${lang} - ${currentPagePath} alternate`} rel="alternate" hrefLang={locationLang[lang]} href={`https://4geeks.com/${lang}${currentPagePath}`} />
        )))}
      </Head>

      {indexPageExists && listToTop && pageProps?.pages > 0 && pageIndexes?.length > 1 && pageProps?.currentPage && (
        <PageIndexes
          pages={pageProps?.pagesArray}
          currentPage={pageProps?.currentPage}
          handlePageChange={handlePageChange} // optional
          margin="0 0 3rem 0"
        />
      )}

      {(typeof renderComponent === 'function' && resultsFilteredByLang?.length > 0) ? resultsFilteredByLang.map((item, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <Box key={index}>{renderComponent(item)}</Box>
      )) : (
        <ProjectList
          projects={resultsFilteredByLang || []}
          withoutDifficulty
          contextFilter={options?.contextFilter}
        />
      )}

      {indexPageExists && listToBottom && pageProps?.pages > 1 && pageIndexes?.length > 1 && pageProps?.currentPage && (
        <PageIndexes
          pages={pageProps?.pagesArray}
          currentPage={pageProps?.currentPage}
          handlePageChange={handlePageChange} // optional
          margin="4rem 0 0 0"
        />
      )}
    </Box>
  ) : (
    <CardSkeleton
      quantity={6}
    />
  );
}

PaginatedView.propTypes = {
  storyConfig: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  renderComponent: PropTypes.func,
  queryFunction: PropTypes.func.isRequired,
  options: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  handlePageChange: PropTypes.func,
};

PaginatedView.defaultProps = {
  storyConfig: {},
  renderComponent: null,
  options: {},
  handlePageChange: null,
};

export default PaginatedView;

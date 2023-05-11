import { Button, ListItem, UnorderedList } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import NextChakraLink from '../NextChakraLink';

function PageIndexes({
  currentPage, pages, handlePageChange, ...rest
}) {
  const totalPages = pages?.length || 0;
  const pageIndices = [1];

  const start = Math.max(2, currentPage - 2);
  const end = Math.min(totalPages - 1, currentPage + 2);

  if (start > 2) {
    pageIndices.push('...');
  }
  for (let i = start; i <= end; i += 1) {
    pageIndices.push(i);
  }
  if (end < totalPages - 1) {
    pageIndices.push('...');
  }

  pageIndices.push(totalPages);

  return currentPage && (
    <UnorderedList display="flex" justifyContent="center" gridGap="16px" {...rest}>
      {pageIndices.map((pageIndex) => (pages[pageIndex - 1] && currentPage !== pageIndex ? (
        <ListItem display="inherit" key={`${pageIndex} - ${pages[pageIndex - 1]}`}>
          {handlePageChange !== null ? (
            <Button
              variant="default"
              // cursor="default"
              onClick={() => handlePageChange({ path: pages[pageIndex - 1], page: pageIndex })}
              padding="8px 14px"
              minHeight="auto"
              height="auto"
            >
              {pageIndex}
            </Button>
          ) : (
            <NextChakraLink
              variant="buttonDefault"
              colorScheme="blue.default"
              padding="8px 14px"
              minHeight="auto"
              _hover={{
                background: 'blue.600',
              }}
              height="auto"
              href={pages[pageIndex - 1]}
            >
              {pageIndex}
            </NextChakraLink>
          )}
        </ListItem>
      ) : (
        <Button
          variant="default"
          background="gray.800"
          cursor="default"
          padding="8px 14px"
          minHeight="auto"
          height="auto"
        >
          {currentPage === pageIndex ? pageIndex : '...'}
        </Button>
      )))}
    </UnorderedList>
  );
}

PageIndexes.propTypes = {
  currentPage: PropTypes.number.isRequired,
  pages: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  handlePageChange: PropTypes.func,
};

PageIndexes.defaultProps = {
  handlePageChange: null,
};

export default PageIndexes;

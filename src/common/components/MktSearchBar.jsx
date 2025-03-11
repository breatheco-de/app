import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Input, Button, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Icon from './Icon';
import useStyle from '../hooks/useStyle';
import HeaderSection from './HeaderSection';

function MktSearchBar({ popularSearches, popularSearchesTitle, headingTop, headingBottom, subtitle, id, padding, ...rest }) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { hexColor, fontColor } = useStyle();
  const router = useRouter();

  const updateQueryParams = (newParams) => {
    const currentQuery = new URLSearchParams(router.query);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        currentQuery.set(key, value);
      } else {
        currentQuery.delete(key);
      }
    });

    const queryString = currentQuery.toString();
    router.replace(`${router.pathname}?${queryString}`, undefined, { shallow: true });
  };

  const handleInputChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateQueryParams({ search });
  };

  const handlePopularSearchClick = (term) => {
    setSearch(term);
    updateQueryParams({ search: term });
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  useEffect(() => {
    if (debouncedSearch !== '') {
      updateQueryParams({ search: debouncedSearch });
    }
  }, [debouncedSearch]);

  return (
    <HeaderSection
      id={id}
      headingTop={headingTop}
      headingBottom={headingBottom}
      subtitle={subtitle}
      padding={padding}
      searchBar={(
        <Box padding="24px" background={hexColor.white2} borderRadius="10px" margin={{ base: '10px', md: 'none' }} color={useColorModeValue('gray.600', 'white')}>
          <form onSubmit={handleSearchSubmit}>
            <Flex
              bg={hexColor.white2}
              borderRadius="4px"
              border="1px solid #DADADA"
              alignItems="center"
              padding="2px 2px 2px 16px"
              gap={2}
            >
              <Icon icon="search" color={fontColor} boxSize={5} />
              <Input
                value={search}
                onChange={handleInputChange}
                placeholder="Search workshops"
                variant="unstyled"
                _placeholder={{ color: useColorModeValue('gray.600', 'white') }}
                flex="1"
              />
              <Button type="submit" borderRadius="4px" bg="blue.500" p={2} _hover={{ bg: 'blue.600' }}>
                <Icon icon="longArrowRight" color="white" />
              </Button>
            </Flex>
          </form>
          <Box mt={4}>
            {popularSearches && (
              <>
                <Text fontSize="sm" mb={2}>
                  {popularSearchesTitle}
                </Text>
                <Flex gap={2} flexWrap="wrap">
                  {popularSearches.map((term) => (
                    <Button
                      key={term}
                      variant="outline"
                      border="1px solid #DADADA"
                      fontSize="13px"
                      height="26px"
                      padding="5px 7px"
                      borderRadius="full"
                      color={useColorModeValue('gray.600', 'white')}
                      onClick={() => handlePopularSearchClick(term)}
                    >
                      {term}
                    </Button>
                  ))}
                </Flex>
              </>
            )}
          </Box>
        </Box>
      )}
      {...rest}
    />
  );
}

MktSearchBar.propTypes = {
  headingTop: PropTypes.string.isRequired,
  headingBottom: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  popularSearches: PropTypes.arrayOf(PropTypes.string),
  popularSearchesTitle: PropTypes.string,
  id: PropTypes.string,
  padding: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
};

MktSearchBar.defaultProps = {
  popularSearchesTitle: 'Popular searches',
  popularSearches: null,
  id: '',
  padding: null,
};

export default MktSearchBar;

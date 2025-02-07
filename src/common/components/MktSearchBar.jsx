import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Input, Button, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Icon from './Icon';
import Heading from './Heading';

function MktSearchBar({ id, headingTop, headingBottom, subtitle, popularSearches, background, popularSearchesTitle, ...rest }) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
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
    <Box id={id} padding={{ base: '10px 0', md: '60px 80px' }} background={useColorModeValue(background)} {...rest}>
      <Box width="auto" maxWidth="961px" margin="0 auto">
        <Heading fontSize="38px" fontWeight="bold" mb={2} textAlign="center">
          {headingTop}
          <br />
          {headingBottom}
        </Heading>
        <Text fontSize="21px" color={useColorModeValue('gray.600')} mb={4} textAlign="center">
          {subtitle}
        </Text>
        <Box padding="24px" background="white" borderRadius="10px" margin={{ base: '10px', md: 'none' }}>
          <form onSubmit={handleSearchSubmit}>
            <Flex
              bg="white"
              borderRadius="4px"
              border="1px solid #DADADA"
              alignItems="center"
              padding="2px 2px 2px 16px"
              gap={2}
            >
              <Icon icon="search" color="black" boxSize={5} />
              <Input
                value={search}
                onChange={handleInputChange}
                placeholder="Search workshops"
                variant="unstyled"
                _placeholder={{ color: 'gray.500' }}
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
                <Text fontSize="sm" color="gray.500" mb={2}>
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
                      color="gray.500"
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
      </Box>
    </Box>
  );
}

MktSearchBar.propTypes = {
  headingTop: PropTypes.string.isRequired,
  headingBottom: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  popularSearches: PropTypes.arrayOf(PropTypes.string).isRequired,
  background: PropTypes.string,
  id: PropTypes.string,
  popularSearchesTitle: PropTypes.string,
};

MktSearchBar.defaultProps = {
  background: 'auto',
  popularSearchesTitle: 'Popular searches',
  id: '',
};

export default MktSearchBar;

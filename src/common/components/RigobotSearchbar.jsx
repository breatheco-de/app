import { useState } from 'react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { Box, Input, Button, Flex, useColorModeValue } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Icon from './Icon';
import useStyle from '../hooks/useStyle';

function RigobotSearchbar({ onSearch }) {
  const { t } = useTranslation('common');
  const [search, setSearch] = useState('');
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
    if (onSearch) onSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      updateQueryParams({ search });
    } else {
      updateQueryParams({ search: null }); // Remove search param if empty
    }
  };

  return (
    <Box display="flex" alignItems="center" gap="15px" padding="8px" background="blue.default3" borderRadius="10px">
      <Icon icon="rigobot-avatar" />
      <form style={{ width: '100%' }} onSubmit={handleSearchSubmit}>
        <Flex
          width="100%"
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
            placeholder={t('rigobot-search-bar.placeholder')}
            variant="unstyled"
            _placeholder={{ color: useColorModeValue('gray.600', 'white') }}
            flex="1"
          />
          <Button type="submit" borderRadius="4px" bg="blue.default3" p={2} _hover={{ bg: 'blue.600' }}>
            <Icon icon="longArrowRight" color="white" />
          </Button>
        </Flex>
      </form>
    </Box>
  );
}

RigobotSearchbar.propTypes = {
  onSearch: PropTypes.func,
};

RigobotSearchbar.defaultProps = {
  onSearch: null,
};

export default RigobotSearchbar;

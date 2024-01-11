import {
  useColorModeValue,
  Input,
  InputLeftElement,
  InputGroup,
  FormControl,
  Box,
} from '@chakra-ui/react';
import { Formik, Form, Field } from 'formik';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../common/components/Icon';
import useDebounce from '../../common/hooks/useDebounce';

function Search({ placeholder, onChange }) {
  const router = useRouter();
  const [value, setValue] = useState('');
  const debouncedSearchTerm = useDebounce(value, 300);

  useEffect(() => {
    if (debouncedSearchTerm) {
      onChange();
      router.push({
        query: {
          ...router.query,
          search: debouncedSearchTerm.toLowerCase(),
        },
      });
    }
  }, [debouncedSearchTerm]);

  return (
    <Formik initialValues={{ search: value }}>
      {() => (
        <Box width={{ base: '-webkit-fill-available', md: '36rem' }}>
          <Form>
            <Field id="field923" name="search">
              {({ form }) => (
                <FormControl isInvalid={form.errors.search && form.touched.search}>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon icon="search" color="gray" width="16px" height="16px" />
                    </InputLeftElement>
                    <Input
                      defaultValue={router?.query?.search}
                      onChange={(e) => {
                        if (e?.target?.value?.length === 0) {
                          router.push({
                            query: {
                              ...router.query,
                              search: '',
                            },
                          });
                        } else {
                          setValue(e.target.value);
                        }
                      }}
                      id="search"
                      width="100%"
                      placeholder={placeholder}
                      transition="all .2s ease"
                      name="search"
                      style={{
                        borderRadius: '3px',
                        backgroundColor: useColorModeValue('white', '#2D3748'),
                      }}
                    />
                  </InputGroup>
                </FormControl>
              )}
            </Field>
          </Form>
        </Box>
      )}
    </Formik>
  );
}

Search.propTypes = {
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
};

Search.defaultProps = {
  placeholder: 'Search',
  onChange: () => {},
};

export default Search;

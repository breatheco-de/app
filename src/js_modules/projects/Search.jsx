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

const Search = ({ placeholder, onChange }) => {
  const router = useRouter();
  const [value, setValue] = useState('');

  useEffect(() => {
    if (router.query.search !== undefined) {
      setValue(router.query.search);
    }
    // initialSearchValue = router.query && router.query.search;
  }, [router.query.search]);

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
                      defaultValue={value}
                      onChange={(values) => {
                        // update the path query with search value
                        setTimeout(() => {
                          onChange();
                          router.push({
                            query: {
                              ...router.query,
                              search: values.target.value.toLowerCase(),
                            },
                          });
                        }, 300);
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
};

Search.propTypes = {
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
};

Search.defaultProps = {
  placeholder: 'Search',
  onChange: () => {},
};

export default Search;

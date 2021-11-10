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
import { useEffect } from 'react';
import Icon from '../../common/components/Icon';

const Search = () => {
  const router = useRouter();
  let initialSearchValue;
  useEffect(() => {
    initialSearchValue = router.query && router.query.search;
  }, [initialSearchValue]);
  return (
    <Formik initialValues={{ search: initialSearchValue }}>
      {() => (
        <Box width={{ base: '-webkit-fill-available', md: '36rem' }}>
          <Form>
            <Field id="field923" name="search">
              {({ field, form }) => (
                <FormControl isInvalid={form.errors.search && form.touched.search}>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon icon="search" color="gray" width="16px" height="16px" />
                    </InputLeftElement>
                    <Input
                      {...field}
                      onChange={(values) => {
                        // update the path query with search value
                        router.push({
                          query: {
                            search: values.target.value,
                          },
                        });
                      }}
                      id="search"
                      width="100%"
                      placeholder="Search Project"
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

export default Search;

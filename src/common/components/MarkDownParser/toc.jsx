import PropTypes from 'prop-types';
import { compiler } from 'markdown-to-jsx';
import { SimpleGrid } from '@chakra-ui/react';
import Anchor from './Anchor';

const Toc = ({ content }) => (
  <SimpleGrid columns={2} spacing={5} bg="blue.light" padding="22px" borderRadius="17px">
    {compiler(content, {
      wrapper: null,
      overrides: {
        h1: {
          component: Anchor,
          props: {
            className: 'foo',
          },
        },
        h2: {
          component: Anchor,
          props: {
            className: 'foo',
          },
        },
        h3: {
          component: Anchor,
          props: {
            className: 'foo',
          },
        },
        h4: {
          component: Anchor,
          props: {
            className: 'foo',
          },
        },
        h5: {
          component: Anchor,
          props: {
            className: 'foo',
          },
        },
        h6: {
          component: Anchor,
          props: {
            className: 'foo',
          },
        },
      },
      slugify: (str) => str.split(' ').join('-').toLowerCase(),
    }).filter((item) => typeof item.type === 'function')}
  </SimpleGrid>
);

Toc.propTypes = {
  content: PropTypes.string,
};
Toc.defaultProps = {
  content: '',
};

export default Toc;

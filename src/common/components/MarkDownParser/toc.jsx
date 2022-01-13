import PropTypes from 'prop-types';
import { compiler } from 'markdown-to-jsx';
import { SimpleGrid, useMediaQuery, useColorModeValue } from '@chakra-ui/react';
import Anchor from './Anchor';

const Toc = ({ content, showTableOfContents }) => {
  const [isNotMobile] = useMediaQuery('(min-width: 1082px)');

  return (
    <SimpleGrid
      margin="0 0 40px 0"
      transition="all .2s ease-in-out"
      display={showTableOfContents ? 'grid' : 'none'}
      columns={2}
      spacing={5}
      background={useColorModeValue('featuredLight', 'featuredDark')}
      style={{ columnGap: isNotMobile ? '4rem' : '2rem' }}
      padding={{ base: '22px', md: '25px 50px' }}
      borderRadius="17px"
    >
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
};

Toc.propTypes = {
  content: PropTypes.string,
  showTableOfContents: PropTypes.bool.isRequired,
};
Toc.defaultProps = {
  content: '',
};

export default Toc;

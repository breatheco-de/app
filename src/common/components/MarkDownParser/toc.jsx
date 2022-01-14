import PropTypes from 'prop-types';
import { compiler } from 'markdown-to-jsx';
import {
  SimpleGrid, UnorderedList, ListItem, useColorMode,
} from '@chakra-ui/react';
import Anchor from './Anchor';

const Toc = ({ content }) => {
  const { colorMode } = useColorMode();
  const getHierarchy = () => {
    const hierarchy = [];
    const headers = compiler(content, {
      wrapper: null,
      overrides: {
        h1: {
          component: Anchor.Parent,
          props: {
            className: 'h1',
          },
        },
        h2: {
          component: Anchor.Parent,
          props: {
            className: 'h2',
          },
        },
        h3: {
          component: Anchor.Child,
          props: {
            className: 'h3',
          },
        },
      },
      slugify: (str) => str.split(' ').join('-').toLowerCase(),
    }).filter((item) => item.props && item.props.className);
    /* Hierarchy, h1 or h2 being parents and h3 being its inmediate childs, childs become a list. */
    let lastParent = 0;
    for (let i = 0; i < headers.length; i += 1) {
      if (headers[i].props.className === 'h1' || headers[i].props.className === 'h2') {
        hierarchy.push({
          h: headers[i],
          childs: [],
        });
        lastParent = i;
      } else {
        hierarchy[lastParent].childs.push({
          h: headers[i],
          childs: null,
        });
      }
    }
    return hierarchy;
  };

  return (
    <SimpleGrid columns={[1, null, 2]} spacing={3} bg={colorMode === 'light' ? 'blue.light' : 'featuredDark'} paddingX="28px" paddingY={22} borderRadius="17px">
      {getHierarchy().map((item) => (
        <>
          {Array.isArray(item.childs) ? (
            <UnorderedList listStyleType="none" margin={0} padding={0}>
              {item.h}
              {item.childs.map((c) => <ListItem margin={0}>{c.h}</ListItem>)}
            </UnorderedList>
          ) : item.h}
        </>
      ))}
    </SimpleGrid>
  );
};

Toc.propTypes = {
  content: PropTypes.string,
};
Toc.defaultProps = {
  content: '',
};

export default Toc;

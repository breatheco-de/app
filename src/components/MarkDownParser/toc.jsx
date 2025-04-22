/* eslint-disable react/no-array-index-key */
import PropTypes from 'prop-types';
import { compiler } from 'markdown-to-jsx';
import {
  UnorderedList, ListItem, useColorMode, Box,
} from '@chakra-ui/react';
import React, { Fragment } from 'react';
import Anchor from './Anchor';
import { slugify } from '../../utils';

function Toc({ content }) {
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
      slugify: (str) => slugify(String(str)),
      // slugify: (str) => str.split(' ').join('-').toLowerCase(),

    }).filter((item) => item && item.props !== null && item.props?.className);
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
        hierarchy[lastParent]?.childs.push({
          h: headers[i],
          childs: null,
        });
      }
    }
    return hierarchy;
  };

  /*   const getRows = () => {
    let count = getHierarchy().length;
    getHierarchy().forEach((e) => {
      console.log(e.childs);
      if (Array.isArray(e.childs) && e.childs.length > 0) {
        count += e.childs.length;
      }
    });
    console.log(Math.trunc(count / 3));
    return Math.trunc(count / 3);
  };
 */
  return getHierarchy().length > 0 && (
    <Box
      bg={colorMode === 'light' ? 'blue.light' : 'featuredDark'}
      w="100%"
      mx="auto"
      // sx={{ columnCount: [1, 2, 3], columnGap: '8px' }}
      paddingX="28px"
      paddingY={22}
      borderRadius="17px"
    >
      {getHierarchy().map((item, index) => {
        const mapIndex = index;
        const isLastItem = index === getHierarchy().length - 1;
        return (
          <Fragment key={mapIndex}>
            {Array.isArray(item.childs) && item.childs.length > 0 ? (
              <Box display="inline-flex" flexDirection="column" mb={!isLastItem ? '8px' : '0'}>
                {item.h}
                <UnorderedList
                  display="flex"
                  flexDirection="column"
                  margin="6px 0 0 10px"
                  padding="0 0 0 6px"
                  gridGap="4px"
                  position="relative"
                  _before={item.childs.length > 0 && {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '2px',
                    height: '92%',
                    bg: colorMode === 'light' ? '#DADADA' : '#3E526A',
                    borderRadius: '2px',
                    transform: 'translate(0, 5%)',
                  }}
                  listStyleType="none"
                  // style={{ padding: 0 }}
                >
                  {item.childs.map((c, i) => (
                    <ListItem key={i} style={{ margin: 0 }}>
                      {c.h}
                    </ListItem>
                  ))}
                </UnorderedList>
              </Box>
            ) : <Box color="black" mb={!isLastItem ? '8px' : '0'}>{item.h}</Box>}
          </Fragment>
        );
      })}
    </Box>
  );
}

Toc.propTypes = {
  content: PropTypes.string,
};
Toc.defaultProps = {
  content: '',
};

export default Toc;

/* eslint-disable react/no-array-index-key */
import PropTypes from 'prop-types';
import { compiler } from 'markdown-to-jsx';
import {
  UnorderedList, ListItem, useColorMode, Grid, GridItem,
} from '@chakra-ui/react';
import React, { Fragment } from 'react';
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

  const getColumnCount = () => {
    const columnLimitator = (getHierarchy().length / 3) < 3;
    const count = columnLimitator ? 2 : 3;
    return count;
  };
  const columnCount = getColumnCount();

  const getRows = () => {
    let count = getHierarchy().length;
    getHierarchy().forEach((e) => {
      if (Array.isArray(e.childs)) {
        count += e.childs.length;
      }
    });
    return Math.ceil(count / 3);
  };

  return (
    <Grid
      bg={colorMode === 'light' ? 'blue.light' : 'featuredDark'}
      templateRows={`repeat(${getRows()}, 1fr)`}
      templateColumns={`repeat(${columnCount}, 1fr)`}
      gap={4}
      paddingX="28px"
      paddingY={22}
      borderRadius="17px"
    >
      {getHierarchy().map((item, index) => {
        const mapIndex = index;
        return (
          <Fragment key={mapIndex}>
            {Array.isArray(item.childs) ? (
              <GridItem
                rowSpan={item.childs.length}
                colSpan={1}
              >
                {item.h}
                <UnorderedList
                  position="relative"
                  _before={item.childs.length > 0 && {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '2px',
                    height: '85%',
                    bg: colorMode === 'light' ? '#DADADA' : '#3E526A',
                    borderRadius: '2px',
                    transform: 'translate(0, 10%)',
                  }}
                  listStyleType="none"
                  margin={0}
                  padding={0}
                  style={{ margin: 0 }}
                >
                  {item.childs.map((c, i) => <ListItem key={i} margin={0}>{c.h}</ListItem>)}
                </UnorderedList>
              </GridItem>
            ) : <GridItem colSpan={1}>{item.h}</GridItem>}
          </Fragment>
        );
      })}
    </Grid>
  );
};

Toc.propTypes = {
  content: PropTypes.string,
};
Toc.defaultProps = {
  content: '',
};

export default Toc;

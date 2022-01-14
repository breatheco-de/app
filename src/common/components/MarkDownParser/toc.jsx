import PropTypes from 'prop-types';
import { compiler } from 'markdown-to-jsx';
import {
  Box, SimpleGrid, UnorderedList, ListItem,
} from '@chakra-ui/react';
import Anchor from './Anchor';

const Anchor2 = ({ children, ...props }) => {
  const { id, ...rest } = props;
  return (
    <Box
      marginLeft="20px"
      _before={{
        content: '""',
        position: 'absolute',
        width: '2px',
        height: '26px',
        bg: '#DADADA',
        marginLeft: '-9px',
        borderRadius: '2px',
      }}
    >
      <Box fontWeight="bold" fontSize="15px" {...rest} color="blue.default" as="a" href={`#${id}`}>{children}</Box>
    </Box>
  );
};

Anchor2.propTypes = {
  children: PropTypes.node,
  id: PropTypes.string,
};
Anchor2.defaultProps = {
  children: '',
  id: '',
};

const Toc = ({ content }) => {
  const getHierarchy = () => {
    const hierarchy = [];
    const headers = compiler(content, {
      wrapper: null,
      overrides: {
        h1: {
          component: Anchor,
          props: {
            className: 'h1',
          },
        },
        h2: {
          component: Anchor2,
          props: {
            className: 'h2',
          },
        },
        h3: {
          component: Anchor2,
          props: {
            className: 'h2',
          },
        },
      },
      slugify: (str) => str.split(' ').join('-').toLowerCase(),
    }).filter((item) => item.props && item.props.className);

    console.log(headers);

    for (let i = 0; i < headers.length; i += 1) {
      if (headers[i].props.className !== 'h1') {
        hierarchy.push({
          h: headers[i],
          childs: null,
        });
      } else {
        hierarchy.push({
          h: headers[i],
          childs: [],
        });
      }
      if (headers[i - 1] !== undefined && headers[i - 1].props.className === 'h1') {
        hierarchy[hierarchy.length - 1].childs.push(headers[i]);
      }
    }

    return hierarchy;
  };

  return (
    <SimpleGrid columns={2} spacing={5} bg="blue.light" padding="22px" borderRadius="17px">
      {getHierarchy().map((item) => (
        <>
          {Array.isArray(item.childs) ? (
            <UnorderedList listStyleType="none">
              {item.h}
              {item.childs.map((c) => <ListItem>{c}</ListItem>)}
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

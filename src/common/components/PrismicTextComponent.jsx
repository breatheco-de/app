/* eslint-disable react/prop-types */
import { PrismicRichText } from '@prismicio/react';
import PropTypes from 'prop-types';
import { ListItem, UnorderedList } from '@chakra-ui/react';
import useStyle from '../hooks/useStyle';
import Text from './Text';
import Heading from './Heading';

const PrismicTextComponent = ({ field }) => {
  const { fontColor2 } = useStyle();

  return (
    <PrismicRichText
      field={field}
      components={{
        heading2: ({ children }) => (
          <Heading size="xl">
            {children}
          </Heading>
        ),
        list: ({ children }) => (
          <UnorderedList margin="0 1.5em">
            {children}
          </UnorderedList>
        ),
        listItem: ({ children }) => (
          <ListItem
            fontSize="sm"
            lineHeight="18px"
            margin="15px 0"
            color={fontColor2}
          >
            {children}
          </ListItem>
        ),
        paragraph: ({ children }) => (
          <Text
            fontSize="sm"
            lineHeight="18px"
            margin="15px 0"
            color={fontColor2}
          >
            {children}
          </Text>
        ),
      }}
    />
  );
};

PrismicTextComponent.propTypes = {
  field: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default PrismicTextComponent;

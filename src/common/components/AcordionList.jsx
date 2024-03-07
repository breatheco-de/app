import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Heading from './Heading';

function AcordionList({ defaultIndex, allowMultiple, list, color, highlightColor, containerStyles, ...rest }) {
  return list?.length > 0 && (
    <Accordion defaultIndex={defaultIndex} allowMultiple={allowMultiple} display="flex" flexDirection="column" gridGap="16px" {...containerStyles}>
      {list?.map((item, i) => (
        <AccordionItem display="flex" gridGap="10px" flexDirection="column" key={item?.title} border="1px solid" borderColor="blue.default" borderRadius="17px" {...rest} borderBottom={rest?.borderBottom && i < list.length - 1 ? rest.borderBottom : ''}>
          {({ isExpanded }) => (
            <>
              <Heading as="h3">
                <AccordionButton padding="17px" color={color} _expanded={{ color: highlightColor || 'blue.default', padding: '17px 17px 0' }}>
                  <Box as="span" flex="1" fontSize="14px" textAlign="left" textTransform="uppercase">
                    {item?.title}
                  </Box>
                  <AccordionIcon
                    width="24px"
                    height="24px"
                    transform={isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)'}
                  />
                </AccordionButton>
              </Heading>
              <AccordionPanel padding="0 17px 17px" fontSize="14px">
                {item?.description}
              </AccordionPanel>
            </>
          )}
        </AccordionItem>
      ))}
    </Accordion>
  );
}

AcordionList.propTypes = {
  defaultIndex: PropTypes.arrayOf(PropTypes.number),
  allowMultiple: PropTypes.bool,
  list: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  color: PropTypes.string,
  highlightColor: PropTypes.string,
  containerStyles: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.any])),
};
AcordionList.defaultProps = {
  defaultIndex: null,
  allowMultiple: false,
  list: [],
  color: 'currentColor',
  highlightColor: '',
  containerStyles: {},
};
export default AcordionList;

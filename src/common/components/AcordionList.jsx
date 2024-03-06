import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Heading from './Heading';

function AcordionList({ list, color, highlightColor, ...rest }) {
  return list?.length > 0 && (
    <Accordion allowMultiple display="flex" flexDirection="column" gridGap="16px">
      {list?.map((item) => (
        <AccordionItem display="flex" gridGap="10px" flexDirection="column" key={item?.title} border="1px solid" borderColor="blue.default" borderRadius="17px" {...rest}>
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
  list: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  color: PropTypes.string,
  highlightColor: PropTypes.string,
};
AcordionList.defaultProps = {
  list: [],
  color: 'currentColor',
  highlightColor: '',
};
export default AcordionList;

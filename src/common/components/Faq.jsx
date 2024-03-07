/* eslint-disable no-unused-vars */
import PropTypes from 'prop-types';
import {
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import Heading from './Heading';
import Text from './Text';
import useStyle from '../hooks/useStyle';

function Faq({ items, hideLastBorder, headingStyle, highlightColor, acordionContainerStyle, ...rest }) {
  const { hexColor } = useStyle();
  return (
    <Box position="relative" background={hexColor.featuredColor} padding="15px" borderRadius="10px" {...rest}>
      <Heading textAlign="center" margin="20px 0" {...headingStyle}>
        FAQ
      </Heading>
      <Accordion borderRadius="15px" padding="20px" allowMultiple background={hexColor.white2} {...acordionContainerStyle}>
        {items.map((item, i) => (
          <AccordionItem key={item.label} borderTop="none" borderBottom={(hideLastBorder && items.length - 1 > i) ? '1px solid #DADADA' : '0px'}>
            <AccordionButton padding="20px 10px 10px 10px" _expanded={{ color: highlightColor }}>
              <Box as="span" flex="1" textAlign="left">
                <Heading size="sm">
                  {item.label}
                </Heading>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4} dangerouslySetInnerHTML={{ __html: item.answer }} />
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  );
}

Faq.propTypes = {
  items: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  acordionContainerStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.any])),
  headingStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.any])),
  hideLastBorder: PropTypes.bool,
  highlightColor: PropTypes.string,
};
Faq.defaultProps = {
  acordionContainerStyle: {},
  headingStyle: {},
  hideLastBorder: false,
  highlightColor: '',
};

export default Faq;

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

function Faq({ items, ...rest }) {
  const { hexColor } = useStyle();
  return (
    <Box position="relative" background={hexColor.featuredColor} padding="15px" borderRadius="10px" {...rest}>
      <Heading textAlign="center" margin="20px 0">
        FAQ
      </Heading>
      <Accordion borderRadius="15px" padding="20px" allowMultiple background={hexColor.white2}>
        {items.map((item) => (
          <AccordionItem key={item.label} borderTop="none" borderBottom="1px solid #DADADA">
            <AccordionButton padding="20px 10px 10px 10px">
              <Box as="span" flex="1" textAlign="left">
                <Heading size="sm">
                  {item.label}
                </Heading>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4} dangerouslySetInnerHTML={{ __html: item.answer }} />
            {/* <AccordionPanel pb={4}>
              {item.answer}
            </AccordionPanel> */}
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  );
}

Faq.propTypes = {
  items: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
};

export default Faq;

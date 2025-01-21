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

function Faq({ id,
  title,
  items,
  hideLastBorder,
  headingStyle,
  highlightColor,
  acordionContainerStyle,
  titleFontSize,
  titleLineHeight,
  titleFontWeight,
  titleColor,
  faqBackgroundColor,
  faqMarginBottom,
  itemLabelColor,
  labelWeight,
  labelFontSize,
  labelLineHeight,

  ...rest }) {
  const { hexColor } = useStyle();
  return (
    <Box position="relative" marginBottom={faqMarginBottom} background={faqBackgroundColor || hexColor.blueLight} padding="15px" borderRadius="10px" {...rest}>
      <Heading textAlign="center" margin="20px 0" {...headingStyle} color={titleColor} fontSize={titleFontSize || headingStyle.fontSize} lineHeight={titleLineHeight} fontWeight={titleFontWeight}>
        {title || 'FAQ'}
      </Heading>
      <Accordion borderRadius="15px" padding="20px" allowMultiple background={hexColor.white2} {...acordionContainerStyle}>
        {items?.map((item, i) => (
          <AccordionItem key={item.label} borderTop="none" borderBottom={(hideLastBorder && items.length - 1 > i) ? '1px solid #DADADA' : '0px'}>
            <AccordionButton padding="20px 10px 10px 10px" _expanded={{ color: highlightColor }}>
              <Box as="span" flex="1" textAlign="left">
                <Heading size={labelFontSize || 'sm'} color={itemLabelColor} weight={labelWeight} lineHeight={labelLineHeight}>
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
  title: PropTypes.string,
  id: PropTypes.string,
  titleFontSize: PropTypes.string,
  titleFontWeight: PropTypes.string,
  titleLineHeight: PropTypes.string,
  titleColor: PropTypes.string,
  faqBackgroundColor: PropTypes.string,
  faqMarginBottom: PropTypes.string,
  itemLabelColor: PropTypes.string,
  labelWeight: PropTypes.string,
  labelFontSize: PropTypes.string,
  labelLineHeight: PropTypes.string,
};
Faq.defaultProps = {
  acordionContainerStyle: {},
  headingStyle: {},
  hideLastBorder: false,
  highlightColor: '',
  title: '',
  id: '',
  titleFontSize: '',
  titleFontWeight: '',
  titleLineHeight: '',
  titleColor: '',
  faqBackgroundColor: '',
  faqMarginBottom: '',
  itemLabelColor: '#01455E',
  labelWeight: 700,
  labelFontSize: '24px',
  labelLineHeight: '28.8px',
};

export default Faq;

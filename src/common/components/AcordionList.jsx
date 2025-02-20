import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Flex, Text } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Heading from './Heading';
import Icon from './Icon';

function AcordionList({
  defaultIndex, allowMultiple, list, color, iconColor, paddingButton, titleStyle,
  highlightColor, containerStyles, unstyled, descriptionStyle, leftIcon, expanderText, ...rest
}) {
  return list?.length > 0 && (
    <Accordion defaultIndex={defaultIndex} allowMultiple={allowMultiple} display="flex" flexDirection="column" gridGap="16px" {...containerStyles}>
      {list?.map((item, i) => (
        <AccordionItem display="flex" gridGap="10px" flexDirection="column" key={item?.title} border={unstyled ? '0px' : '1px solid'} borderColor="blue.default" borderRadius="17px" {...rest} borderBottom={rest?.borderBottom && i < list.length - 1 ? rest.borderBottom : ''}>
          {({ isExpanded }) => (
            <>
              <Heading onClick={item.onClick && item.onClick} as="h3">
                <AccordionButton cursor={item?.description ? 'pointer' : 'default'} padding={paddingButton} color={color} _expanded={{ color: item?.description ? (highlightColor || 'blue.default') : 'currentColor', padding: unstyled ? paddingButton : '17px 17px 0' }}>
                  {leftIcon && <Icon icon={leftIcon} color={iconColor} width="16px" height="16px" marginRight="10px" />}
                  <Box as="span" flex="1" fontSize="14px" textAlign="left" textTransform="uppercase" {...titleStyle}>
                    {item?.title}
                  </Box>
                  {expanderText && <Text fontSize="13px">{expanderText}</Text>}
                  <AccordionIcon
                    display={item?.description ? 'block' : 'none'}
                    width="30px"
                    height="30px"
                    color={iconColor}
                    transform={isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)'}
                  />
                </AccordionButton>
              </Heading>
              <AccordionPanel padding="0 17px 17px" fontSize="14px" {...descriptionStyle}>
                {item?.description}
              </AccordionPanel>
              {/*esto es lo que hay que cambiar en lo que tomas me diga donde encontrar esa info*/}
              <Flex gap="10px" padding="0 18px 18px 18px" alignItems="center">
                <Icon icon="certificate" color="#0097CD" width="16px" height="16px" />
                <Text fontSize="12px">Course Certificate</Text>

                <Icon icon="book" color="#0097CD" width="16px" height="16px" />
                <Text fontSize="12px">4 Readings</Text>

                <Icon icon="strength" color="#0097CD" width="16px" height="16px" />
                <Text fontSize="12px">1 Exercise</Text>

                <Icon icon="clock" color="#0097CD" width="16px" height="16px" />
                <Text fontSize="12px">18 Hours</Text>
              </Flex>
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
  titleStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.any])),
  descriptionStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.any])),
  iconColor: PropTypes.string,
  unstyled: PropTypes.bool,
  paddingButton: PropTypes.string,
  leftIcon: PropTypes.string,
  expanderText: PropTypes.string,
};
AcordionList.defaultProps = {
  defaultIndex: null,
  allowMultiple: false,
  list: [],
  color: 'currentColor',
  highlightColor: '',
  containerStyles: {},
  titleStyle: {},
  iconColor: 'currentColor',
  descriptionStyle: {},
  unstyled: false,
  paddingButton: '17px',
  leftIcon: '',
  expanderText: '',
};
export default AcordionList;

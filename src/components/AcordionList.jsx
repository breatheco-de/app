import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Flex, Text } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import Heading from './Heading';
import Icon from './Icon';

function AcordionList({
  defaultIndex, allowMultiple, list, color, iconColor, paddingButton, titleStyle,
  highlightColor, containerStyles, unstyled, descriptionStyle, leftIcon, expanderText, featuresStyle, allowToggle, ...rest
}) {
  const { t } = useTranslation();
  return list?.length > 0 && (
    <Accordion defaultIndex={defaultIndex} allowMultiple={allowMultiple} display="flex" flexDirection="column" gridGap="16px" allowToggle={allowToggle} {...containerStyles}>
      {list?.map((item, i) => (
        <AccordionItem
          display="flex"
          gridGap="10px"
          flexDirection="column"
          key={item?.title}
          border={unstyled ? '0px' : '1px solid'}
          borderColor="blue.default2"
          borderRadius="17px"
          {...rest}
          borderBottom={rest?.borderBottom && i < list.length - 1 ? rest.borderBottom : ''}
        >
          {({ isExpanded }) => (
            <>
              <Heading onClick={item.onClick && item.onClick} as="h3">
                <AccordionButton
                  cursor={item?.description ? 'pointer' : 'default'}
                  padding={paddingButton}
                  color={color}
                  _expanded={{
                    color: item?.description ? (highlightColor || 'blue.default2') : 'currentColor',
                    padding: unstyled ? paddingButton : '17px 17px 0',
                  }}
                >
                  {leftIcon && (
                    <Icon icon={leftIcon} color={iconColor} width="16px" height="16px" marginRight="10px" />
                  )}
                  <Box as="span" flex="1" fontSize="14px" textAlign="left" textTransform="uppercase" {...titleStyle}>
                    {item?.title}
                  </Box>
                  {expanderText && (
                    <Text fontSize="13px">
                      {!isExpanded ? expanderText : `${t('common:hide')} ${expanderText.toLowerCase()}`}
                    </Text>
                  )}
                  <AccordionIcon
                    display={item?.description ? 'block' : 'none'}
                    width="30px"
                    height="30px"
                    color={iconColor}
                    transform={isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)'}
                  />
                </AccordionButton>
              </Heading>
              {(item?.readings > 0 || item?.exercises > 0 || item?.time || item?.certificate) && (
                <Flex gap="15px" padding="0 18px 18px 18px" alignItems="center">
                  {item?.certificate && (
                    <Flex gap="2px" {...featuresStyle}>
                      <Icon icon="certificate" color="#0084FF" width="16px" height="16px" />
                      <Text fontSize="12px">{t('course:course-certificate')}</Text>
                    </Flex>
                  )}
                  {item?.readings > 0 && (
                    <Flex gap="2px" {...featuresStyle}>
                      <Icon icon="book" color="#0084FF" width="16px" height="16px" />
                      <Text fontSize="12px">{t('course:course-readings', { count: item?.readings })}</Text>
                    </Flex>
                  )}
                  {item?.exercises > 0 && (
                    <Flex gap="2px" {...featuresStyle}>
                      <Icon icon="strength" color="#0084FF" width="16px" height="16px" />
                      <Text fontSize="12px">{t('course:course-exercises', { count: item?.readings })}</Text>
                    </Flex>
                  )}
                  {item?.time && (
                    <Flex gap="2px" {...featuresStyle}>
                      <Icon icon="clock" color="#0084FF" width="16px" height="16px" />
                      <Text fontSize="12px">{item.time}</Text>
                    </Flex>
                  )}
                </Flex>
              )}
              <AccordionPanel padding="0 17px 17px" fontSize="14px" {...descriptionStyle}>
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
  titleStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.any])),
  descriptionStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.any])),
  iconColor: PropTypes.string,
  unstyled: PropTypes.bool,
  paddingButton: PropTypes.string,
  leftIcon: PropTypes.string,
  expanderText: PropTypes.string,
  featuresStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.any])),
  allowToggle: PropTypes.bool,
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
  featuresStyle: {},
  allowToggle: false,
};
export default AcordionList;

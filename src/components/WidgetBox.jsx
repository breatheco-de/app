import { Box, Flex } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Icon from './Icon';
import Text from './Text';
import Link from './NextChakraLink';
import Heading from './Heading';
import useStyle from '../hooks/useStyle';

function WidgetBox({ title, children, items, ...rest }) {
  const { backgroundColor, featuredColor, borderColor2, hexColor } = useStyle();

  return (
    <Box width="100%" maxWidth={{ base: 'none', md: '400px' }} zIndex={10} borderRadius="17px" padding="0 2px 2px 2px" background={featuredColor} {...rest}>
      <Heading size="14px" textAlign="center" p="12px 8px" width="100%" background={featuredColor} borderTopLeftRadius="13px" borderTopRightRadius="13px">
        {title}
      </Heading>
      <Flex flexDirection="column" background={backgroundColor} padding="0 8px" borderRadius="0 0 17px 17px">
        {children}
        <Flex flexDirection="column" gridGap="10px" padding="12px 8px" maxHeight="17rem" overflow="auto">
          {items.map((item) => (
            <Link key={item.id || item.href} cursor="pointer" href={item.href} _target="blank">
              <Flex gridGap="8px" _hover={{ background: featuredColor }} borderRadius="11px" alignItems="center" padding="8px" border="1px solid" borderColor={borderColor2}>
                <Flex gridGap="16px" width="100%" alignItems="center">
                  <Box display="flex" justifyContent="center" alignItems="center" width="46px" height="46px" background={hexColor.featuredColor} borderRadius="4px">
                    <Icon icon={item.icon} color={hexColor.blueDefault} width="24px" height="24px" padding="12px" />
                  </Box>
                  <Flex flexDirection="column" gridGap="5px">
                    <Heading size="12px" fontWeight={900}>
                      {item.title}
                    </Heading>
                    <Text size="12px" fontWeight={400} title={item?.comment}>
                      {item.description}
                    </Text>
                  </Flex>
                </Flex>
                <Icon icon="arrowLeft" width="13px" height="10px" padding="8px" style={{ flexShrink: 0, transform: 'rotate(180deg)' }} />
              </Flex>
            </Link>
          ))}
        </Flex>
      </Flex>
    </Box>
  );
}

WidgetBox.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  items: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
};
WidgetBox.defaultProps = {
  children: null,
  items: [],
};

export default WidgetBox;

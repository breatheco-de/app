import {
  Box, Heading, Stack, Flex, useColorModeValue, HStack, Tooltip, Link,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import Text from './Text';
import Icon from './Icon';
import ModalInfo from './ModalInfo';

function TaskBar({
  onClickHandler, data, containerStyle, leftContentStyle, containerPX, width, currIndex,
  isDone, rightItemHandler, link, textWithLink, mandatory, onDisabledClick,
}) {
  const { t } = useTranslation('dashboard');
  const containerBackground = isDone ? useColorModeValue('featuredLight', 'featuredDark') : useColorModeValue('white', 'primary');
  const commonFontColor = useColorModeValue('gray.600', 'gray.200');
  const [openModal, setOpenModal] = useState(false);

  const borderColor = () => {
    if (mandatory) return 'yellow.default';
    if (isDone) return 'transparent';
    return useColorModeValue('gray.350', 'gray.700');
  };

  return (
    <Stack
      width={width}
      style={containerStyle}
      gridGap="12px"
      direction="row"
      backgroundColor={containerBackground}
      border={mandatory ? '2px solid' : `${useColorModeValue('1px', '2px')} solid`}
      borderColor={borderColor()}
      height="auto"
      py="10px"
      px={containerPX || '15px'}
      my="10px"
      rounded="2xl"
      overflow="hidden"
      key={`${data.title}-${currIndex}`}
      _hover={{ bg: useColorModeValue('blue.light', 'featuredDark') }}
    >
      <ModalInfo
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        title={t('modules.target-blank-title')}
        isReadonly
        description={t('modules.target-blank-msg', { title: data.title })}
        link={data.url}
        handlerText={t('common:open')}
        closeText={t('common:close')}
        closeButtonVariant="outline"
        actionHandler={() => {
          if (window !== undefined) {
            setOpenModal(false);
            window.open(data.url, '_blank');
          }
        }}
      />
      <Flex width="100%" alignItems="center">
        {currIndex !== null && (
          <>
            {mandatory ? (
              <Icon icon="warning" color="yellow.default" width="28px" height="28px" style={{ marginRight: '15px' }} />
            ) : (
              <Box
                width="30px"
                minWidth="30px"
                alignSelf="center"
                mr="15px"
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="30px"
                rounded="full"
                align="center"
                background={isDone ? '#0097CF' : '#BFBFBF'}
              >
                <Text fontWeight="bold" margin="0" size="sm" color="#FFFFFF">
                  {currIndex + 1}
                </Text>
              </Box>
            )}
          </>
        )}
        {data.icon && (
          <Box display={{ base: 'none', sm: 'flex' }} mr="20px" ml="20px" minWidth="22px" width="22px">
            <Icon
              icon={data.icon || 'book'}
              color={isDone ? '#0097CF' : '#A4A4A4'}
            />
          </Box>
        )}
        {process.env.NODE_ENV === 'development' && data.iconProp && (
          <Tooltip label={data.iconProp.tooltip} placement="top">
            <Box display={{ base: 'none', sm: 'flex' }} style={data.iconProp.style} minWidth={data.iconProp.width || '22px'} width={data.iconProp.width || '22px'}>
              <Icon
                icon={data.iconProp.icon || 'book'}
                color={data.iconProp.color || isDone ? '#0097CF' : '#A4A4A4'}
                width={data.iconProp.width}
                height={data.iconProp.height}
              />
            </Box>
          </Tooltip>
        )}
        {textWithLink ? (
          <Link
            href={data.target === 'blank' ? '#_blank' : link}
            onClick={(e) => {
              onDisabledClick();
              if (data.target === 'blank') {
                e.preventDefault();
                e.stopPropagation();
                setOpenModal(true);
              }
            }}
            style={leftContentStyle}
            width="auto"
          >
            {data.type && (
              <Heading
                as="h3"
                fontSize="13px"
                color={commonFontColor}
                lineHeight="18px"
                letterSpacing="0.05em"
                margin="0"
                isTruncated
                fontWeight="900"
                textTransform="uppercase"
              >
                {data.type}
              </Heading>
            )}
            <Text
              size="l"
              fontWeight="normal"
              color={commonFontColor}
              lineHeight="18px"
              letterSpacing="0.05em"
              margin="0"
            >
              {data.title}
            </Text>
          </Link>
        ) : (
          <Flex
            cursor="pointer"
            onClick={onClickHandler}
            flexDirection="column"
            style={leftContentStyle}
            justifyContent="center"
          >
            {data.type && (
              <Heading
                as="h3"
                fontSize="13px"
                color={commonFontColor}
                lineHeight="18px"
                letterSpacing="0.05em"
                margin="0"
                isTruncated
                fontWeight="900"
                textTransform="uppercase"
              >
                {data.type}
              </Heading>
            )}
            <Text
              size="l"
              fontWeight="normal"
              color={commonFontColor}
              lineHeight="18px"
              letterSpacing="0.05em"
              margin="0"
            >
              {data.title}
            </Text>
          </Flex>
        )}
      </Flex>
      <HStack
        // justifyContent="flex-end"
        flexShrink={0}
        width="auto"
        style={{
          margin: 0,
        }}
      >
        {rightItemHandler}
      </HStack>
    </Stack>
  );
}

TaskBar.propTypes = {
  onClickHandler: PropTypes.func,
  data: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  containerStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  leftContentStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  containerPX: PropTypes.string,
  width: PropTypes.string,
  link: PropTypes.string,
  textWithLink: PropTypes.bool,
  rightItemHandler: PropTypes.element,
  isDone: PropTypes.bool,
  currIndex: PropTypes.number,
  mandatory: PropTypes.bool,
  onDisabledClick: PropTypes.func,
};
TaskBar.defaultProps = {
  onClickHandler: () => {},
  data: {},
  containerStyle: {},
  leftContentStyle: {},
  containerPX: '',
  width: '100%',
  link: '',
  textWithLink: false,
  rightItemHandler: null,
  isDone: false,
  currIndex: null,
  mandatory: false,
  onDisabledClick: () => {},
};

export default TaskBar;

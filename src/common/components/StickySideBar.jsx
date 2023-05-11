import PropTypes from 'prop-types';
import {
  Box, VStack, useColorModeValue, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalCloseButton, ModalBody,
} from '@chakra-ui/react';
import { Fragment, useState } from 'react';
import Icon from './Icon';
import Text from './Text';

function StickySideBar({
  menu, width, top, right, left,
}) {
  // Modal states
  const [openKeyConcepts, setOpenKeyConcepts] = useState(false);
  const [openTeacherInstructions, setOpenTeacherInstructions] = useState(false);

  const highlightColors = useColorModeValue('featuredLight', 'darkTheme');
  const commonBorderColor = useColorModeValue('white', 'gray.700');

  const getCurrentModalState = (itemSlug) => {
    if (itemSlug === 'key-concepts') {
      return openKeyConcepts;
    }
    if (itemSlug === 'teacher-instructions') {
      return openTeacherInstructions;
    }
    return false;
  };

  const getCurrentHandler = (item) => {
    if (item.slug === 'video-player') {
      item.actionHandler();
    }
    if (item.slug === 'key-concepts') {
      setOpenKeyConcepts(true);
    }
    if (item.slug === 'teacher-instructions') {
      item.actionHandler();
    }
  };

  return (
    <VStack
      width={width}
      position="fixed"
      zIndex={9}
      top={top}
      right={right}
      left={left}
    >
      {
          menu.map((item, i) => {
            const currentModalState = getCurrentModalState(item.slug);
            const index = i;
            return item.content && (
              <Fragment key={`${item.id}-index${index}`}>
                <Box
                  key={item.id}
                  textAlign="center"
                  cursor="pointer"
                  as="button"
                  bg="transparent"
                  border="none"
                  onClick={() => getCurrentHandler(item)}
                >
                  <Box
                    bg={useColorModeValue('white', 'featuredDark')}
                    display="flex"
                    alignItems="center"
                    margin="auto"
                    width="fit-content"
                    height="48px"
                    variant="default"
                    padding="15px"
                    border={useColorModeValue('1px solid', '2px solid')}
                    borderColor={useColorModeValue('gray.default', 'gray.500')}
                    borderRadius="full"
                  >
                    <Icon icon={item.icon} width="18px" height="18px" color={useColorModeValue('gray', 'white')} />
                  </Box>
                  <Text
                    width="80px"
                    size="sm"
                    marginTop="3px"
                    color={useColorModeValue('gray.default', 'white')}
                  >
                    {item.title}

                  </Text>
                </Box>

                <Modal
                  isOpen={currentModalState}
                  onClose={() => {
                    setOpenKeyConcepts(false);
                    setOpenTeacherInstructions(false);
                  }}
                >
                  <ModalOverlay />
                  <ModalContent
                    background={useColorModeValue('white', 'featuredDark')}
                    border={2}
                    borderStyle="solid"
                    borderColor={commonBorderColor}
                  >
                    <ModalHeader>{item.title}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                      {
                        Array.isArray(item.content) ? (
                          item.content.map((content, ix) => {
                            const index2 = ix;
                            return (
                              <Box
                                key={index2}
                                as="ul"
                                pl="30px"
                                py="6px"
                                mb="4px"
                                borderRadius="6px"
                                _hover={{
                                  backgroundColor: highlightColors,
                                }}
                              >
                                <Text key={index2} as="li" size="l" fontWeight="400">
                                  {content}
                                </Text>
                              </Box>
                            );
                          })
                        ) : (
                          <Text size="l" pb="25px" fontWeight="400">
                            {item.content}
                          </Text>
                        )
                      }
                    </ModalBody>
                  </ModalContent>
                </Modal>
              </Fragment>
            );
          })
          }
    </VStack>
  );
}

StickySideBar.propTypes = {
  menu: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  width: PropTypes.string,
  top: PropTypes.string,
  right: PropTypes.string,
  left: PropTypes.string,
};

StickySideBar.defaultProps = {
  menu: [],
  width: '100%',
  top: '12%',
  right: '15px',
  left: 'unset',
};

export default StickySideBar;

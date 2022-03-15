import PropTypes from 'prop-types';
import {
  Box, VStack, useColorMode, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalCloseButton, ModalBody,
} from '@chakra-ui/react';
import { Fragment, useState } from 'react';
import Icon from './Icon';
import Text from './Text';

const StickySideBar = ({
  menu, width, top, right, left,
}) => {
  const { colorMode } = useColorMode();
  const [openKeyConcepts, setOpenKeyConcepts] = useState(false);
  const [openTeacherInstructions, setOpenTeacherInstructions] = useState(false);

  const getCurrentModalState = (itemSlug) => {
    if (itemSlug === 'key-concepts') {
      return openKeyConcepts;
    }
    if (itemSlug === 'teacher-instructions') {
      return openTeacherInstructions;
    }
    return false;
  };
  return (
    <>
      <VStack
        width={width}
        position="fixed"
        top={top}
        right={right}
        left={left}
      >
        {
          menu.map((item) => {
            const currentModalState = getCurrentModalState(item.slug);
            return (
              <Fragment key={item.id}>
                {item.content && (
                  <Box
                    key={item.id}
                    textAlign="center"
                    cursor="pointer"
                    as="button"
                    bg="transparent"
                    border="none"
                    onClick={() => {
                      if (item.slug === 'key-concepts') {
                        setOpenKeyConcepts(true);
                      }
                      if (item.slug === 'teacher-instructions') {
                        setOpenTeacherInstructions(true);
                      }
                    }}
                  >
                    <Box
                      bg={colorMode === 'light' ? 'white' : 'blue.default'}
                      margin="auto"
                      width="fit-content"
                      height="48px"
                      variant="default"
                      padding="15px"
                      border="1px solid"
                      borderColor={colorMode === 'light' ? 'gray.default' : 'blue.default'}
                      borderRadius="full"
                    >
                      <Icon icon={item.icon} width="18px" height="18px" color={colorMode === 'light' ? 'gray' : 'white'} />
                    </Box>
                    <Text
                      width="80px"
                      size="sm"
                      marginTop="3px"
                      color={colorMode === 'light' ? 'gray.default' : 'white'}
                    >
                      {item.title}

                    </Text>
                  </Box>
                )}
                {
                  item.content && (
                    <Modal
                      isOpen={currentModalState}
                      onClose={() => {
                        setOpenKeyConcepts(false);
                        setOpenTeacherInstructions(false);
                      }}
                    >
                      <ModalOverlay />
                      <ModalContent>
                        <ModalHeader>{item.title}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                          {
                            Array.isArray(item.content) ? (
                              item.content.map((content) => (
                                <Box key={content}>
                                  <Text size="l" fontWeight="400">
                                    {content}
                                  </Text>
                                </Box>
                              ))
                            ) : item.content
                          }
                        </ModalBody>
                      </ModalContent>
                    </Modal>
                  )
                }
              </Fragment>
            );
          })
        }
      </VStack>
    </>
  );
};

StickySideBar.propTypes = {
  menu: PropTypes.arrayOf(PropTypes.array),
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

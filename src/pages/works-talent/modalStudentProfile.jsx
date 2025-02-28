import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Button,
  Box,
  Text,
  Image,
  Input,
  VStack,
  HStack,
  Tag,
  Avatar,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import Icon from '../../common/components/Icon';
import useStyle from '../../common/hooks/useStyle';

function ModalStudentProfile({ isOpen, onClose }) {
  const { t } = useTranslation('works-talent');
  const { hexColor } = useStyle();

  return (
    <Modal isOpen={isOpen} onClose={onClose} trapFocus={false} width="1024px">
      <ModalOverlay bg="rgba(0, 0, 0, 0.1)" />
      <ModalContent maxWidth={{ base: '90%', md: '896px' }} minWidth={{ base: '100%', ml: '0px' }}>
        <ModalCloseButton color="#A9A9A9" />
        <ModalBody p={0}>
          <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} overflowY="auto" maxHeight="calc(100vh - 100px)">
            {/* Form side left */}
            <Box width={{ base: '100%', md: '376px' }} minHeight="auto" bg={hexColor.featuredColor4} p={4} display="flex" flexDirection="column">
              {/* Photo and details */}
              <HStack spacing={4} align="center">
                <Box
                  width={{ base: '119px', sm: '140px', ml: '160px' }}
                  height={{ base: '119px', sm: '140px', ml: '160px' }}
                  borderRadius="50%"
                  overflow="hidden"
                  border="3px solid #0084FF"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  aspectRatio="1"
                >
                  <Image
                    src="https://s3-alpha-sig.figma.com/img/4c4c/7cb0/61c54f47e6bd57bac0b5b2388de82ddc?Expires=1741564800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=KVMu61~ThYG7lEhnjcMNqQsu0XSxeCCUd9UcmXzQ2WxuzNW62l4T2d~ncE6peMc~hVP4G9SdV6sBHV7AdpvIDoWiEtiKc9AsibjlUb9iTw7uQTAbD-kCgmfNAXAFi0F15imQ~KN-fgUSvw7W3GK9qz2Vbbv-~gTqoES96tBUz9~lfcewv5KXs3tNT4OPQZEibSzzxMBNL80SItVoR~rHgLLWHmsJZ2QW9mNChkCkRrWkiLItgEL9b7a5FsEVNwWfTxmcvEyvIRMHoblXHEpsLSudQkOkCXDhboET-0P~M00oEBvJ0TQg82hfEiJa2EnJW0M1RqxVgEQL8ciGQL-2oQ__"
                    alt="Profile Picture"
                    objectFit="cover"
                    width="149px"
                    height="149px"
                  />
                </Box>

                <Box>
                  <Text mt={4} fontSize="18px" fontWeight={500} lineHeight="19.58px" letterSpacing="0%" color={hexColor.black}>Winston Jesus Lamus Tortolero</Text>
                  <Tag mt={4} mb={4} color="#0084FF" bg="#C7F3FD" borderRadius={7} padding="4px 8px" gap={2} fontSize="12px">Full Stack Developer</Tag>
                  <HStack spacing={2} fontSize="12px" fontWeight={400} lineHeight="14.52px" letterSpacing="0%" align="center" color="#00000">
                    <Avatar
                      width="24px"
                      src="/static/images/languajes.png"
                      height="24px"
                      style={{ userSelect: 'none' }}
                    />
                    <Text fontSize="10px">Español,</Text>
                    <Text fontSize="10px">English</Text>
                  </HStack>
                  <HStack mt={2} spacing={3}>
                    <Icon icon="github" width="18px" />
                    <Icon icon="linkedin" width="18px" color="#0097CF" />
                    <Icon icon="pdf" width="18px" color={hexColor.fontColor2} />
                  </HStack>
                </Box>
              </HStack>
              {/* Form */}
              <Box width="100%" p="38px 0px 0px">
                <Text fontSize="21px" fontWeight={500} lineHeight="22.85px" letterSpacing="0%" marginBottom={4} textAlign="center">{`${t('works-talent:modal-student-profile.title-form')}`}</Text>
                <VStack height="344px" gap="5px" padding={2} align={{ base: 'center', md: 'flex-start' }}>
                  <Input color="#606060" fontWeight={400} fontFamily="Lato" fontSize="15px" lineHeight="22px" letterSpacing="2%" bg={hexColor.white2} placeholder={`${t('works-talent:modal-student-profile.form.full-name')}`} />
                  <Input color="#606060" fontWeight={400} fontFamily="Lato" fontSize="15px" lineHeight="22px" letterSpacing="2%" bg={hexColor.white2} placeholder={`${t('works-talent:modal-student-profile.form.phone')}`} />
                  <Input color="#606060" fontWeight={400} fontFamily="Lato" fontSize="15px" lineHeight="22px" letterSpacing="2%" bg={hexColor.white2} placeholder={`${t('works-talent:modal-student-profile.form.email')}`} />
                  <Input color="#606060" fontWeight={400} fontFamily="Lato" fontSize="15px" lineHeight="22px" letterSpacing="2%" bg={hexColor.white2} placeholder={`${t('works-talent:modal-student-profile.form.company')}`} />
                  <Input color="#606060" fontWeight={400} fontFamily="Lato" fontSize="15px" lineHeight="22px" letterSpacing="2%" bg={hexColor.white2} placeholder={`${t('works-talent:modal-student-profile.form.role')}`} />
                  <Button
                    mt={2}
                    bg="#0084FF"
                    color="white"
                    width="100%"
                    borderRadius="0"
                    size="lg"
                    fontFamily="Lato"
                    fontWeight={700}
                    fontSize="15px"
                    lineHeight="20.4px"
                    letterSpacing="0%"
                  >
                    {`${t('works-talent:modal-student-profile.form.button')}`}
                  </Button>
                </VStack>
              </Box>
            </Box>

            {/* Right Side */}
            <Box width={{ base: '100%', md: '520px' }} minHeight="auto" bg={hexColor.backgroundColor} padding="32px 32px" textAlign="left">
              <Text fontSize="18px" fontWeight="500" lineHeight="19.58px" letterSpacing="0%" color={hexColor.black1}>{`${t('works-talent:modal-student-profile.title-talent')}`}</Text>
              <Text mt={2} fontSize="14px" fontFamily="Lato" fontWeight={400} lineHeight="16.8px" letterSpacing="5%" color={hexColor.fontColor4}>
                {`${t('works-talent:modal-student-profile.talent-description')}`}
              </Text>
              <Text mt={4} fontSize="18px" fontWeight="500" lineHeight={5} letterSpacing="0%" color={hexColor.black}>{`${t('works-talent:modal-student-profile.skills')}`}</Text>
              <HStack mt={4} spacing={2}>
                <Tag borderRadius="11px" fontFamily="Lato" fontWeight="400" fontSize="11px" lineHeight="16.8px" letterSpacing="0%" color={hexColor.black} colorScheme="blue">Fast learner</Tag>
                <Tag borderRadius="11px" fontFamily="Lato" fontWeight="400" fontSize="11px" lineHeight="16.8px" letterSpacing="0%" color={hexColor.black} colorScheme="green">Research-oriented</Tag>
                <Tag borderRadius="11px" fontFamily="Lato" fontWeight="400" fontSize="11px" lineHeight="16.8px" letterSpacing="0%" color={hexColor.black} colorScheme="red">Committed</Tag>
                <Tag borderRadius="11px" fontFamily="Lato" fontWeight="400" fontSize="11px" lineHeight="16.8px" letterSpacing="0%" color={hexColor.black} colorScheme="purple">Dedicated</Tag>
              </HStack>
              <Text mt={4} fontSize="18px" fontWeight="500" lineHeight={5} letterSpacing="0%">
                {`${t('works-talent:modal-student-profile.top-skills')}`}
              </Text>
              <HStack mt={4} spacing={2}>
                <Tag borderRadius="11px" fontFamily="Lato" fontWeight="400" fontSize="11px" lineHeight="16.8px" letterSpacing="0%" color={hexColor.black} colorScheme="yellow">Python</Tag>
                <Tag borderRadius="11px" fontFamily="Lato" fontWeight="400" fontSize="11px" lineHeight="16.8px" letterSpacing="0%" color={hexColor.black} colorScheme="teal">JavaScript</Tag>
                <Tag borderRadius="11px" fontFamily="Lato" fontWeight="400" fontSize="11px" lineHeight="16.8px" letterSpacing="0%" color={hexColor.black} colorScheme="orange">React</Tag>
              </HStack>
              <Text mt={4} fontSize="18px" fontWeight="500" lineHeight={5} letterSpacing="0%">{`${t('works-talent:modal-student-profile.background')}`}</Text>
              <HStack mt={4} spacing={2}>
                <Tag borderRadius="11px" fontFamily="Lato" fontWeight="400" fontSize="11px" lineHeight="16.8px" letterSpacing="0%" color={hexColor.black} colorScheme="cyan">Business</Tag>
                <Tag borderRadius="11px" fontFamily="Lato" fontWeight="400" fontSize="11px" lineHeight="16.8px" letterSpacing="0%" color={hexColor.black} colorScheme="pink">Administration</Tag>
                <Tag borderRadius="11px" fontFamily="Lato" fontWeight="400" fontSize="11px" lineHeight="16.8px" letterSpacing="0%" color={hexColor.black} colorScheme="gray">Full Stack</Tag>
              </HStack>
            </Box>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

ModalStudentProfile.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ModalStudentProfile;

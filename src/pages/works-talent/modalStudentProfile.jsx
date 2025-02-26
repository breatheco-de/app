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
  Icon,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { EmailIcon, LinkIcon, DownloadIcon } from '@chakra-ui/icons';

function ModalStudentProfile({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" trapFocus={false}>
      <ModalOverlay bg="rgba(0, 0, 0, 0.1)" />
      <ModalContent width="896px" height="622px">
        <ModalCloseButton />
        <ModalBody display="flex" p={0}>
          {/* Form side left */}
          <Box width="376px" height="622px" bg="#F4F9FF" p={4} display="flex" flexDirection="column">
            {/* Photo and details */}
            <HStack spacing={4} align="center">
              <Image
                borderRadius="full"
                boxSize="119px"
                border="3px solid #0084FF"
                src="https://s3-alpha-sig.figma.com/img/4c4c/7cb0/61c54f47e6bd57bac0b5b2388de82ddc?Expires=1741564800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=KVMu61~ThYG7lEhnjcMNqQsu0XSxeCCUd9UcmXzQ2WxuzNW62l4T2d~ncE6peMc~hVP4G9SdV6sBHV7AdpvIDoWiEtiKc9AsibjlUb9iTw7uQTAbD-kCgmfNAXAFi0F15imQ~KN-fgUSvw7W3GK9qz2Vbbv-~gTqoES96tBUz9~lfcewv5KXs3tNT4OPQZEibSzzxMBNL80SItVoR~rHgLLWHmsJZ2QW9mNChkCkRrWkiLItgEL9b7a5FsEVNwWfTxmcvEyvIRMHoblXHEpsLSudQkOkCXDhboET-0P~M00oEBvJ0TQg82hfEiJa2EnJW0M1RqxVgEQL8ciGQL-2oQ__"
                alt="Profile Picture"
                cover="100%"
                objectFit="cover"
              />
              <Box>
                <Text mt={4} fontSize="18px" fontWeight={500} lineHeight="19.58px" letterSpacing="0%">Winston Jesus Lamus Tortolero</Text>
                <Tag mt={4} mb={4} color="#0084FF" bg="#C7F3FD" borderRadius={7} padding="4px 8px" gap={2} fontSize="12px">Full Stack Developer</Tag>
                <HStack spacing={2} fontSize="12px" fontWeight={400} lineHeight="14.52px" letterSpacing="0%" align="center" color="#00000">
                  <Text>Español</Text>
                  <Text>English</Text>
                </HStack>
                <HStack mt={2} spacing={4}>
                  <Icon as={EmailIcon} w={4} h={4} />
                  <Icon as={LinkIcon} w={4} h={4} />
                  <Icon as={DownloadIcon} w={4} h={4} />
                </HStack>
              </Box>
            </HStack>
            {/* Form */}
            <Box width="100%" p="48px 16px" align="center">
              <Text fontSize="21px" fontWeight={500} lineHeight="22.85px" letterSpacing="0%" marginBottom={4}>Meet with this talent</Text>
              <VStack align="stretch" width="280px" height="344px" gap="10px">
                <Input color="#606060" fontWeight={400} fontFamily="Lato" fontSize="15px" lineHeight="22px" letterSpacing="2%" bg="white" placeholder=" Full Name*" />
                <Input color="#606060" fontWeight={400} fontFamily="Lato" fontSize="15px" lineHeight="22px" letterSpacing="2%" bg="white" placeholder="Phone Number*" />
                <Input color="#606060" fontWeight={400} fontFamily="Lato" fontSize="15px" lineHeight="22px" letterSpacing="2%" bg="white" placeholder="Email*" />
                <Input color="#606060" fontWeight={400} fontFamily="Lato" fontSize="15px" lineHeight="22px" letterSpacing="2%" bg="white" placeholder="Company" />
                <Input color="#606060" fontWeight={400} fontFamily="Lato" fontSize="15px" lineHeight="22px" letterSpacing="2%" bg="white" placeholder="Role" />
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
                  Get an interview
                </Button>
              </VStack>
            </Box>
          </Box>

          {/* Right Side */}
          <Box width="504px" height="622px" bg="white" padding="32px 16px" textAlign="left">
            <Text fontSize="18px" fontWeight="500" lineHeight="19.58px" letterSpacing="0%">Why hire this talent?</Text>
            <Text mt={2} fontSize="14px" fontFamily="Lato" fontWeight={400} lineHeight="16.8px" letterSpacing="5%" color="#606060">
              He is passionate about technology and continuous improvement, stays constantly updated on the latest trends in artificial intelligence, automation, and big data. His proactive and results-oriented approach, combined with strong teamwork and leadership skills, allows him to collaborate effectively with different areas to ensure the success of the technological projects he participates in.
            </Text>
            <Text mt={4} fontSize="18px" fontWeight="500" lineHeight={5} letterSpacing="0%">Skills</Text>
            <HStack mt={4} spacing={2}>
              <Tag fontFamily="Lato" fontWeight="400" fontSize="11px" lineHeight="16.8px" letterSpacing="0%" color="#000000" colorScheme="blue">Fast learner</Tag>
              <Tag fontFamily="Lato" fontWeight="400" fontSize="11px" lineHeight="16.8px" letterSpacing="0%" color="#000000" colorScheme="green">Research-oriented</Tag>
              <Tag fontFamily="Lato" fontWeight="400" fontSize="11px" lineHeight="16.8px" letterSpacing="0%" color="#000000" colorScheme="red">Committed</Tag>
              <Tag fontFamily="Lato" fontWeight="400" fontSize="11px" lineHeight="16.8px" letterSpacing="0%" color="#000000" colorScheme="purple">Dedicated</Tag>
            </HStack>
            <Text mt={4} fontSize="18px" fontWeight="500" lineHeight={5} letterSpacing="0%">Top 3 technologies</Text>
            <HStack mt={4} spacing={2}>
              <Tag fontFamily="Lato" fontWeight="400" fontSize="11px" lineHeight="16.8px" letterSpacing="0%" color="#000000" colorScheme="yellow">Python</Tag>
              <Tag fontFamily="Lato" fontWeight="400" fontSize="11px" lineHeight="16.8px" letterSpacing="0%" color="#000000" colorScheme="teal">JavaScript</Tag>
              <Tag fontFamily="Lato" fontWeight="400" fontSize="11px" lineHeight="16.8px" letterSpacing="0%" color="#000000" colorScheme="orange">React</Tag>
            </HStack>
            <Text mt={4} fontSize="18px" fontWeight="500" lineHeight={5} letterSpacing="0%">Background</Text>
            <HStack mt={4} spacing={2}>
              <Tag fontFamily="Lato" fontWeight="400" fontSize="11px" lineHeight="16.8px" letterSpacing="0%" color="#000000" colorScheme="cyan">Business</Tag>
              <Tag fontFamily="Lato" fontWeight="400" fontSize="11px" lineHeight="16.8px" letterSpacing="0%" color="#000000" colorScheme="pink">Administration</Tag>
              <Tag fontFamily="Lato" fontWeight="400" fontSize="11px" lineHeight="16.8px" letterSpacing="0%" color="#000000" colorScheme="gray">Full Stack</Tag>
            </HStack>
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

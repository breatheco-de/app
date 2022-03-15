import {
  Box, Heading, Text, Button,
} from '@chakra-ui/react';
import NextChakraLink from '../common/components/NextChakraLink';

export default function NotFound() {
  return (
    <Box textAlign="center" py={10} px={6} height="70vh">
      <Heading
        display="inline-block"
        as="h2"
        size="2xl"
        bgGradient="linear(to-r, blue.400, blue.600)"
        backgroundClip="text"
      >
        404
      </Heading>
      <Text fontSize="18px" mt={3} mb={2}>
        Page Not Found
      </Text>
      <Text color="gray.500" mb={6}>
        The page you&apos;re looking for does not seem to exist
      </Text>
      <Button
        colorScheme="blue"
        bgGradient="linear(to-r, blue.400, blue.500, blue.600)"
        color="white"
        variant="solid"
      >
        <NextChakraLink
          href="/"
          _hover={{
            textDecoration: 'none',
          }}
        >
          Go to Home
        </NextChakraLink>
      </Button>
    </Box>
  );
}

import {
  Box, Heading, Text,
} from '@chakra-ui/react';
import NextChakraLink from '../common/components/NextChakraLink';
import Button from '../common/components/Button';

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
        variant="primary"
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

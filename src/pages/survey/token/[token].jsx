import React from 'react';
import {
  Box,
  Container,
  Flex,
  Spinner,
  Stack,
} from '@chakra-ui/react';
import { useSurveyToken } from '../../../hooks/useSurveyToken';
import SurveyForm from '../../../components/Survey/SurveyForm';
import Login from '../../../components/Forms/LogIn';
import Heading from '../../../components/Heading';
import Text from '../../../components/Text';
import useStyle from '../../../hooks/useStyle';

function SurveyTokenPage() {
  const {
    survey,
    loading,
    error,
    isAuthenticated,
    handleLoginSuccess,
    handleSurveyComplete,
    t,
  } = useSurveyToken();

  const { fontColor2 } = useStyle();

  // Show loading state
  if (loading) {
    return (
      <Container maxW="800px" padding="24px" minH="60vh">
        <Flex justify="center" align="center" minH="60vh">
          <Stack spacing={4} align="center">
            <Spinner size="xl" color="blue.500" />
            <Text color={fontColor2}>{t('loading')}</Text>
          </Stack>
        </Flex>
      </Container>
    );
  }

  // Show error state
  if (error && isAuthenticated) {
    return (
      <Container maxW="800px" padding="24px" minH="60vh">
        <Flex justify="center" align="center" minH="60vh">
          <Stack spacing={4} align="center">
            <Heading size="md" color={fontColor2}>
              {t('error.title')}
            </Heading>
            <Text color={fontColor2} textAlign="center">
              {error}
            </Text>
          </Stack>
        </Flex>
      </Container>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return (
      <Container maxW="600px" padding="24px" minH="60vh">
        <Flex direction="column" justify="center" align="center" minH="60vh">
          <Box width="100%" marginBottom="32px">
            <Heading size="lg" color={fontColor2} textAlign="center" marginBottom="16px">
              {t('login-required.title')}
            </Heading>
            <Text color={fontColor2} textAlign="center" marginBottom="24px">
              {t('login-required.description')}
            </Text>
          </Box>
          <Box width="100%">
            <Login callBack={handleLoginSuccess} disableRedirect />
          </Box>
        </Flex>
      </Container>
    );
  }

  // Show survey form if authenticated and survey loaded
  if (survey) {
    return <SurveyForm survey={survey} onComplete={handleSurveyComplete} />;
  }

  return null;
}

export default SurveyTokenPage;

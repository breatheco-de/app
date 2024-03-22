import { useEffect, useState } from 'react';
import { Box, Button, Flex, Link } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import bc from '../services/breathecode';
import { decodeBase64, getStorageItem, unSlugifyCapitalize } from '../../utils';
import ReviewModal from './ReviewModal';
import Icon from './Icon';
import Text from './Text';
import Heading from './Heading';
import AlertMessage from './AlertMessage';
import useStyle from '../hooks/useStyle';
import useAuth from '../hooks/useAuth';
import { error } from '../../utils/logging';
import { BREATHECODE_HOST } from '../../utils/variables';

const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

function Feedback({ storyConfig }) {
  const { t, lang } = useTranslation('choose-program');
  const { isAuthenticated, user } = useAuth();
  const accessToken = getStorageItem('accessToken');
  const { backgroundColor, featuredColor, borderColor2, hexColor } = useStyle();
  const [selectedData, setSelectedData] = useState({});
  const [codeRevisions, setCodeRevisions] = useState([]);
  const [isAuthenticatedWithRigobot, setIsAuthenticatedWithRigobot] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isStorybookView = storyConfig?.externalCodeRevisions;
  const translationChooseProgram = storyConfig?.translation?.[storyConfig?.locale]['choose-program'];
  const storybookTranslation = storyConfig?.translation?.[storyConfig?.locale];
  const isConnectedWithGithub = user?.github?.username;

  const learnWhyLink = {
    en: 'https://4geeks.com/mastering-technical-knowledge#feedback-quality-and-frequency',
    es: 'https://4geeks.com/es/mastering-technical-knowledge#calidad-y-frecuencia-del-feedback',
  };

  const handleOpen = (data) => {
    const isFileCodeBase64 = base64regex.test(data?.file?.content);
    const isReviewCodeBase64 = base64regex.test(data?.original_code);
    const fileContent = isFileCodeBase64 ? decodeBase64(data?.file?.content) : data?.file?.content;
    const originalCode = isReviewCodeBase64 ? decodeBase64(data.original_code) : data.original_code;
    setSelectedData({
      code_revisions: codeRevisions,
      commitFile: {
        ...data?.file,
        path: data?.file?.name,
        url: data?.file?.file_url,
        name: data?.file?.name,
        code: fileContent,
      },
      revision_content: {
        ...data,
        code: originalCode,
      },
    });
    setIsOpen(true);
  };

  const getCodeRevisions = async () => {
    try {
      if (isConnectedWithGithub) {
        const response = await bc.assignments().getPersonalCodeRevisions();
        const data = await response.json();

        if (response.ok) {
          const codeRevisionsSortedByDate = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setCodeRevisions(codeRevisionsSortedByDate);
        }
      }
    } catch (errorData) {
      error('Error fetching code revisions:', errorData);
    }
  };
  const verifyRigobotConnection = async () => {
    const resp = await bc.auth().verifyRigobotConnection(accessToken);
    const data = await resp.json();
    if (data) {
      setIsAuthenticatedWithRigobot(true);
    }
  };

  useEffect(() => {
    if (isStorybookView) {
      setCodeRevisions(storyConfig?.externalCodeRevisions);
    }
    if (isAuthenticated) {
      getCodeRevisions();
      verifyRigobotConnection();
    }
  }, [isAuthenticated, isStorybookView]);

  return (isAuthenticated || isStorybookView) && (
    <Box width="100%" maxWidth="400px" zIndex={10} borderRadius="17px" padding="0 2px 2px 2px" background={featuredColor}>
      <Heading size="16px" textAlign="center" p="12px 8px" width="100%" background={featuredColor} borderTopLeftRadius="13px" borderTopRightRadius="13px">
        {translationChooseProgram?.feedback?.title || t('feedback.title')}
      </Heading>
      <Flex flexDirection="column" background={backgroundColor} padding="0 8px" borderRadius="0 0 17px 17px">
        <Flex flexDirection="column" my="6px" gridGap="6px">
          {!(storyConfig?.isAuthenticatedWithRigobot || isAuthenticatedWithRigobot) && (
            <AlertMessage
              type="warning"
              background="yellow.light"
              border="0px"
              color="black"
              full
              fontSize="12px"
              borderRadius="4px"
              textAlign="left"
              padding="8px"
              gridGap="10px"
              secondColor="transparent"
            >
              {isConnectedWithGithub ? (
                <Text size="12px" textAlign="start">
                  {translationChooseProgram?.feedback?.['connect-rigobot-text'] || t('feedback.connect-rigobot-text')}
                  {' '}
                  <Link href={`https://rigobot.herokuapp.com/invite/?referer=4Geeks&token=${accessToken}`} color="currentcolor" textDecoration="underline" fontSize="12px" variant="default">
                    {translationChooseProgram?.feedback?.['connect-rigobot'] || t('feedback.connect-rigobot')}
                  </Link>
                  .
                </Text>
              ) : (
                <Text size="12px" textAlign="start">
                  <Button
                    variant="link"
                    height="auto"
                    as="span"
                    textAlign="start"
                    color="currentColor"
                    fontWeight="normal"
                    cursor="pointer"
                    textDecoration="underline"
                    fontSize="12px"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `${BREATHECODE_HOST}/v1/auth/github/${accessToken}?url=${window.location.href}`;
                    }}
                  >
                    {t('common:connect-with-github')}
                  </Button>
                  {' '}
                  {t('feedback.connect-github-connector')}
                </Text>
              )}
            </AlertMessage>
          )}
          <Text size="12px" textAlign="center">
            {translationChooseProgram?.feedback?.['why-feedback-text'] || t('feedback.why-feedback-text')}
            {' '}
            <Link fontSize="12px" variant="default" href={learnWhyLink[lang]}>
              {translationChooseProgram?.feedback?.['learn-why'] || t('feedback.learn-why')}
              .
            </Link>
          </Text>
        </Flex>
        <Flex flexDirection="column" gridGap="10px" padding="12px 8px" maxHeight="17rem" overflow="auto">
          {codeRevisions?.length > 0 ? codeRevisions.map((revision) => (
            <Flex gridGap="8px" onClick={() => handleOpen(revision)} _hover={{ background: featuredColor }} cursor="default" borderRadius="11px" alignItems="center" padding="8px" border="1px solid" borderColor={borderColor2}>
              <Flex gridGap="16px" width="100%" alignItems="center">
                <Icon icon="code-comment" color={hexColor.blueDefault} width="24px" height="24px" padding="12px" />
                <Flex flexDirection="column" gridGap="5px">
                  <Heading size="12px" fontWeight={900}>
                    {revision?.repository?.name
                      ? unSlugifyCapitalize(revision?.repository?.name)
                      : t('feedback.code-review')}
                  </Heading>
                  <Text size="12px" fontWeight={400} title={revision?.comment}>
                    {revision?.comment.length >= 40
                      ? `${revision?.comment.slice(0, 25)}...`
                      : revision?.comment}
                  </Text>
                </Flex>
              </Flex>
              <Icon icon="arrowLeft" width="13px" height="10px" padding="8px" style={{ flexShrink: 0, transform: 'rotate(180deg)' }} />
            </Flex>
          )) : (
            <AlertMessage
              type="info"
              withoutIcon
              background={featuredColor}
              border="0px"
              iconColor={hexColor.black}
              color="currentcolor"
              full
              fontSize="12px"
              borderRadius="4px"
              padding="8px"
            >
              {translationChooseProgram?.feedback?.['no-code-reviews-text'] || t('feedback.no-code-reviews-text')}
            </AlertMessage>
          )}
        </Flex>
        <ReviewModal
          isExternal
          externalData={{
            ...selectedData,
            translation: storybookTranslation,
          }}
          isStudent
          defaultStage="code_review"
          fixedStage
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      </Flex>
    </Box>
  );
}

Feedback.propTypes = {
  storyConfig: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool, PropTypes.array, PropTypes.object])),
};
Feedback.defaultProps = {
  storyConfig: null,
};

export default Feedback;

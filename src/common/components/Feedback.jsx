import { useEffect, useState } from 'react';
import { Box, Flex, Link, useToast } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import bc from '../services/breathecode';
import { getStorageItem, unSlugifyCapitalize } from '../../utils';
import ReviewModal from './ReviewModal';
import Icon from './Icon';
import Text from './Text';
import Heading from './Heading';
import AlertMessage from './AlertMessage';
import useStyle from '../hooks/useStyle';
import useAuth from '../hooks/useAuth';

function Feedback() {
  const { t, lang } = useTranslation('choose-program');
  const { isAuthenticated } = useAuth();
  const accessToken = getStorageItem('accessToken');
  const { backgroundColor, featuredColor, borderColor2, hexColor } = useStyle();
  const [selectedData, setSelectedData] = useState({});
  const [codeRevisions, setCodeRevisions] = useState([]);
  const [isAuthenticatedWithRigobot, setIsAuthenticatedWithRigobot] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const toast = useToast();
  const learnWhyLink = {
    en: 'https://4geeks.com/mastering-technical-knowledge',
    es: 'https://4geeks.com/es/mastering-technical-knowledge',
  };

  const handleOpen = (data) => {
    const code = atob(data?.file?.content);
    const selectionOfReviewCode = atob(data.original_code);
    setSelectedData({
      code_revisions: codeRevisions,
      commitFile: {
        ...data?.file,
        path: data?.file?.name,
        url: data?.file?.file_url,
        name: data?.file?.name,
        code,
      },
      revision_content: {
        ...data,
        code: selectionOfReviewCode,
      },
    });
    setIsOpen(true);
  };

  const getCodeRevisions = async () => {
    try {
      const response = await bc.assignments().getPersonalCodeRevisions();
      const data = await response.json();

      if (response.ok) {
        const codeRevisionsSortedByDate = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setCodeRevisions(codeRevisionsSortedByDate);
      } else {
        toast({
          title: t('alert-message:something-went-wrong'),
          description: 'Cannot get code revisions',
          status: 'error',
          duration: 5000,
          position: 'top',
          isClosable: true,
        });
      }
    } catch (error) {
      error('Error fetching code revisions:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      getCodeRevisions();
      bc.auth().verifyRigobotConnection(accessToken)
        .then((response) => {
          if (response.data) {
            setIsAuthenticatedWithRigobot(true);
          }
        });
    }
  }, [isAuthenticated]);

  return isAuthenticated && (
    <Box width="330px" zIndex={10} borderRadius="17px" padding="0 2px 2px 2px" background={featuredColor}>
      <Heading size="14px" textAlign="center" p="12px 8px" width="100%" background={featuredColor} borderTopLeftRadius="13px" borderTopRightRadius="13px">
        {t('feedback.title')}
      </Heading>
      <Flex flexDirection="column" background={backgroundColor} padding="0 8px" borderRadius="0 0 17px 17px">
        <Flex flexDirection="column" my="6px" gridGap="6px">
          {!isAuthenticatedWithRigobot && (
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
              <Text size="12px" textAlign="start">
                {t('feedback.connect-rigobot-text')}
                {' '}
                <Link href={`https://rigobot.herokuapp.com/invite/?referer=4Geeks&token=${accessToken}`} color="currentcolor" textDecoration="underline" fontSize="12px" variant="default">
                  {t('feedback.connect-rigobot')}
                </Link>
                .
              </Text>
            </AlertMessage>
          )}
          <Text size="12px" textAlign="center">
            {t('feedback.why-feedback-text')}
            {' '}
            <Link fontSize="12px" variant="default" href={learnWhyLink[lang]}>
              {t('feedback.learn-why')}
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
              {t('feedback.no-code-reviews-text')}
            </AlertMessage>
          )}
        </Flex>
        <ReviewModal
          isExternal
          externalData={selectedData}
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

export default Feedback;

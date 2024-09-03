import { Box, Button, Flex } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import useStyle from '../../hooks/useStyle';
import Icon from '../Icon';
import Text from '../Text';

function CodeRevisionsList({ contextData, selectCodeRevision, ...rest }) {
  const { fontColor, borderColor, hexColor, featuredLight } = useStyle();
  const { t } = useTranslation('assignments');

  const codeRevisions = contextData?.code_revisions || [];
  const revisionContent = contextData?.revision_content;

  return (
    <Flex overflow="auto" height="24rem" py="0.5rem" flexDirection="column" gridGap="12px" {...rest}>
      {codeRevisions.map((commit) => {
        const isSelected = revisionContent?.id === commit?.id;
        const hasBeenReviewed = typeof commit?.is_good === 'boolean';
        const dataStruct = {
          ...commit,
          revision_rating: commit?.revision_rating,
          hasBeenReviewed,
        };
        return (
          <Flex key={commit.id} cursor="pointer" onClick={() => selectCodeRevision(dataStruct)} _hover={{ background: featuredLight }} border="1px solid" borderColor={isSelected ? 'blue.default' : borderColor} justifyContent="space-between" alignItems="center" height="48px" padding="4px 8px" borderRadius="8px">
            <Flex flex={0.3} gridGap="10px">
              <Icon icon="file2" width="22px" height="22px" display="flex" alignItems="center" color={fontColor} />
              <Flex flexDirection="column" justifyContent="center" gridGap="9px" maxWidth="102px">
                <Flex flexDirection="column" gridGap="0px">
                  <Text fontSize="12px" fontWeight={700} style={{ textWrap: 'nowrap', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {commit?.file?.name}
                  </Text>
                  <Text fontSize="12px" fontWeight={400} title={commit?.file?.commit_hash}>
                    {`${commit?.file?.commit_hash?.slice(0, 10)}...`}
                  </Text>
                </Flex>
                {commit?.committer?.github_username && (
                <Box fontSize="12px">
                  {commit?.committer?.github_username}
                </Box>
                )}
              </Flex>
            </Flex>

            <Flex flex={0.3} justifyContent="center" alignItems="center">
              <Flex width="auto" position="relative" justifyContent="center">
                <Box position="absolute" top={-1.5} right={-2} background={hasBeenReviewed ? 'success' : 'yellow.default'} fontSize="10px" padding="3px" fontWeight={700} height="auto" borderRadius="50%">
                  <Icon icon={hasBeenReviewed ? 'verified2' : 'asterisk'} width="8px" height="8px" />
                </Box>
                <Icon icon="code-comment" width="20px" height="20px" color={hexColor.black} />
              </Flex>
            </Flex>
            <Button
              variant="link"
              flex={0.3}
              height="40px"
              onClick={() => selectCodeRevision(dataStruct)}
              display="flex"
              width="fit-content"
              justifyContent="flex-end"
              alignItems="center"
              padding="0 1rem 0 0"
              gridGap="10px"
            >
              {t('code-review.review')}
            </Button>
          </Flex>
        );
      })}
    </Flex>
  );
}
CodeRevisionsList.propTypes = {
  selectCodeRevision: PropTypes.func,
  contextData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
};
CodeRevisionsList.defaultProps = {
  selectCodeRevision: () => {},
};

export default CodeRevisionsList;

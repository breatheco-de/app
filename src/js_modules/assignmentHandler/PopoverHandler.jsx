/* eslint-disable react/jsx-no-useless-fragment */
import {
  Box, Button, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import { LinkIcon } from '@chakra-ui/icons';
import Icon from '../../common/components/Icon';
import bc from '../../common/services/breathecode';
import Text from '../../common/components/Text';
import Link from '../../common/components/NextChakraLink';
import useStyle from '../../common/hooks/useStyle';
import useCohortHandler from '../../common/hooks/useCohortHandler';

function PopoverHandler({ task, githubUrl, haveGithubDomain }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [assetData, setAssetData] = useState(null);
  const { state } = useCohortHandler();
  const { cohortSession } = state;
  const [fileData, setFileData] = useState([]);
  const { t } = useTranslation('assignments');
  const { backgroundColor, hexColor } = useStyle();
  const toast = useToast();

  const isUrl = assetData?.delivery_formats.includes('url');
  const noDeliveryFormat = assetData?.delivery_formats.includes('no_delivery');
  const fileUrl = 'https://storage.googleapis.com/';

  const handleOpen = async (currentTask) => {
    if (currentTask && currentTask?.task_type === 'PROJECT' && currentTask.task_status === 'DONE') {
      setIsFetching(true);
      const assetResp = await bc.lesson().getAsset(currentTask.associated_slug);
      if (assetResp && assetResp.status < 400) {
        setIsFetching(false);
        const data = await assetResp.data;
        setAssetData(data);

        if (!data?.delivery_formats.includes('url')) {
          const fileResp = await bc.todo().getFile({ id: currentTask.id, academyId: cohortSession?.academy?.id });
          if (fileResp && fileResp.status < 400) {
            const respData = await fileResp.data;
            setFileData(respData);
            setSettingsOpen(true);
          } else {
            toast({
              position: 'top',
              title: t('alert-message:current-task-no-files'),
              status: 'error',
              duration: 4000,
              isClosable: true,
            });
          }
        } else {
          setSettingsOpen(true);
        }
      }
    }
  };

  return (
    <Box minWidth="62px" width={githubUrl ? 'auto' : '4%'}>
      {githubUrl && (

        <Popover
          id="Avatar-Hover"
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          trigger="click"
        >
          <PopoverTrigger>
            <Button onClick={() => handleOpen(task)} isLoading={isFetching} padding="0 2px 0 10px" background={backgroundColor}>
              <Box display="flex" alignItems="center">
                <Icon icon="documentVerified" width="24px" height="30px" color={hexColor.blueDefault} />
                <Icon icon="arrowDown" width="26px" height="26px" color={hexColor.blueDefault} />
              </Box>
            </Button>
          </PopoverTrigger>
          {assetData && assetData?.delivery_formats && (
            <PopoverContent maxW="280px">
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverHeader>
                {!isUrl && fileData?.length > 0
                  ? t('label.files-received', { files: fileData?.length })
                  : t('label.link-received')}
              </PopoverHeader>
              <PopoverBody>
                {noDeliveryFormat ? (
                  <Text size="l">
                    {t('review-assignment.no-review-required')}
                  </Text>
                ) : (
                  <>
                    {isUrl ? (
                      <Link variant="default" display="flex" gridGap="6px" href={githubUrl || '#'} target="_blank" rel="noopener noreferrer">
                        {githubUrl && haveGithubDomain && (
                          <Icon icon="github" width="20px" height="20px" style={{ minWidth: '20px' }} color={hexColor.black} />
                        )}
                        {githubUrl && !haveGithubDomain && !githubUrl.includes(fileUrl) && (
                          <LinkIcon width="20px" height="20px" style={{ minWidth: '20px' }} />
                        )}
                        {githubUrl && !haveGithubDomain && githubUrl.includes(fileUrl) && (
                          <Icon icon="file" width="20px" height="20px" style={{ minWidth: '20px' }} color={hexColor.black} />
                        )}
                        <Text size="l" withLimit={assetData.title.length > 28}>
                          {assetData.title}
                        </Text>
                        {githubUrl.includes(fileUrl) && (
                          <Icon icon="download" width="22px" height="22px" color={hexColor.blueDefault} />
                        )}
                      </Link>
                    ) : (
                      <Box display="flex" flexDirection="column" gridGap="8px" maxHeight="135px" overflowY="auto">
                        {fileData.length > 0 && fileData?.map((file) => {
                          const extension = file.name.split('.').pop();
                          return (
                            <Link
                              variant="default"
                              width="100%"
                              justifyContent="space-between"
                              key={file.id}
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              // margin="0 0 0 10px"
                              display="flex"
                              gridGap="8px"
                            >
                              <Text size="l" withLimit={file.name.length > 28}>
                                {file.name}
                              </Text>
                              {extension && (
                                <Icon icon="download" width="16px" height="16px" color={hexColor.blueDefault} />
                              )}
                            </Link>
                          );
                        })}
                      </Box>
                    )}
                  </>
                )}
              </PopoverBody>
            </PopoverContent>
          )}
        </Popover>
      )}
    </Box>
  );
}

PopoverHandler.propTypes = {
  task: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  githubUrl: PropTypes.string.isRequired,
  haveGithubDomain: PropTypes.bool,
};
PopoverHandler.defaultProps = {
  task: {},
  haveGithubDomain: false,
};

export default PopoverHandler;

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import useCohortHandler from '../../common/hooks/useCohortHandler';
import CallToAction from '../../common/components/CallToAction';
import modifyEnv from '../../../modifyEnv';
import ModalToCloneProject from './ModalToCloneProject';
import Text from '../../common/components/Text';
import Icon from '../../common/components/Icon';

function OpenWithLearnpackCTA({ currentAsset, variant }) {
  const { t, lang } = useTranslation('common');
  const [learnpackActions, setLearnpackActions] = useState([]);
  const { state } = useCohortHandler();
  const { cohortSession } = state;
  const [showCloneModal, setShowCloneModal] = useState(false);
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
  const openInLearnpackAction = t('learnpack.open-in-learnpack-button', {}, { returnObjects: true });

  const accessToken = localStorage.getItem('accessToken');

  const provisioningLinks = [{
    title: t('learnpack.new-exercise'),
    link: `${BREATHECODE_HOST}/v1/provisioning/me/container/new?token=${accessToken}&cohort=${cohortSession?.id}&repo=${currentAsset?.url}`,
    isExternalLink: true,
  },
  {
    title: t('learnpack.continue-exercise'),
    link: `${BREATHECODE_HOST}/v1/provisioning/me/workspaces?token=${accessToken}&cohort=${cohortSession?.id}&repo=${currentAsset?.url}`,
    isExternalLink: true,
  }];

  useEffect(() => {
    const localhostAction = {
      text: `${t('learnpack.open-locally')}`,
      type: 'button',
      onClick: () => {
        setShowCloneModal(true);
      },
    };
    const cloudActions = {
      ...openInLearnpackAction,
      text: `${openInLearnpackAction.text}${cohortSession?.available_as_saas === false ? ` (${t('learnpack.recommended')})` : ''}`,
      links: provisioningLinks,
    };
    if (cohortSession?.id) {
      if (!currentAsset?.gitpod) setLearnpackActions([localhostAction]);
      else if (cohortSession.available_as_saas) setLearnpackActions([localhostAction, cloudActions]);
      else setLearnpackActions([cloudActions, localhostAction]);
    }
  }, [lang, cohortSession?.id, currentAsset?.url]);

  if (variant === 'small') {
    return (
      <>
        <Box mt="10px" background="blue.default" padding="8px" borderRadius="8px" display="flex" alignItems="center" gap="10px">
          <Icon icon="learnpack" />
          <Box>
            <Text color="white" size="md">
              {t('learnpack.choose-open')}
            </Text>
            <Box mt="10px" display="flex" gap="10px" flexDirection={{ base: 'column', md: 'row' }}>
              <Popover>
                <PopoverTrigger>
                  <Button size="sm" padding="4px 8px" fontSize="14px" fontWeight="500" background="gray.200" color="blue.default">
                    {t('learnpack.open-in-learnpack-button.text')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent width="min-content">
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverHeader>{openInLearnpackAction.title}</PopoverHeader>
                  <PopoverBody display="flex" gridGap="1rem" color="currentColor" flexDirection="column">
                    <Text
                      size="14px"
                      dangerouslySetInnerHTML={{ __html: openInLearnpackAction?.description }}
                      style={{ margin: 0 }}
                    />
                    {provisioningLinks.map((link) => (
                      <Button
                        key={link.text}
                        as="a"
                        display="flex"
                        href={link.link}
                        target={link.isExternalLink ? '_blank' : '_self'}
                        marginY="auto"
                        margin="0"
                        textTransform="uppercase"
                        width="100%"
                        flexDirection="row"
                        gridGap="10px"
                        fontSize="12px"
                        alignItems="center"
                        justifyContent="flex-start"
                        style={{
                          color: 'currentColor',
                        }}
                      >
                        {link.title}
                        <Icon color="currentColor" icon="longArrowRight" />
                      </Button>
                    ))}
                  </PopoverBody>
                </PopoverContent>
              </Popover>
              <Button size="sm" padding="4px 8px" fontSize="14px" fontWeight="500" background="gray.200" color="blue.default" onClick={() => setShowCloneModal(true)}>
                {t('learnpack.open-locally')}
              </Button>
            </Box>
          </Box>
        </Box>
        <ModalToCloneProject currentAsset={currentAsset} isOpen={showCloneModal} onClose={setShowCloneModal} />
      </>
    );
  }

  return (
    <>
      <CallToAction
        buttonStyle={{
          color: 'white',
        }}
        background="blue.default"
        reverseButtons={cohortSession?.available_as_saas}
        margin="12px 0 20px 0px"
        icon="learnpack"
        text={t('learnpack.description', { projectName: currentAsset?.title })}
        width={{ base: '100%', md: 'fit-content' }}
        buttonsData={learnpackActions}
        buttonsContainerStyles={{ alignSelf: 'auto' }}
      />
      <ModalToCloneProject currentAsset={currentAsset} isOpen={showCloneModal} onClose={setShowCloneModal} />
    </>
  );
}

OpenWithLearnpackCTA.propTypes = {
  variant: PropTypes.string,
  currentAsset: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.array])),
};
OpenWithLearnpackCTA.defaultProps = {
  variant: null,
  currentAsset: null,
};

export default OpenWithLearnpackCTA;

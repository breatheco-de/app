import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import useCohortHandler from '../../common/hooks/useCohortHandler';
import CallToAction from '../../common/components/CallToAction';
import modifyEnv from '../../../modifyEnv';
import ModalToCloneProject from './ModalToCloneProject';

function OpenWithLearnpackCTA({ currentAsset }) {
  const { t, lang } = useTranslation('common');
  const [learnpackActions, setLearnpackActions] = useState([]);
  const { state } = useCohortHandler();
  const { cohortSession } = state;
  const [showCloneModal, setShowCloneModal] = useState(false);
  const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });

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
    const openInLearnpackAction = t('learnpack.open-in-learnpack-button', {}, { returnObjects: true });
    const localhostAction = {
      text: `${t('learnpack.open-locally')}${cohortSession?.available_as_saas ? ` (${t('learnpack.recommended')})` : ''}`,
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
      />
      <ModalToCloneProject currentAsset={currentAsset} isOpen={showCloneModal} onClose={setShowCloneModal} />
    </>
  );
}

OpenWithLearnpackCTA.propTypes = {
  currentAsset: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.array])),
};
OpenWithLearnpackCTA.defaultProps = {
  currentAsset: null,
};

export default OpenWithLearnpackCTA;

import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import MarkDownParser from '../../common/components/MarkDownParser';
import SimpleModal from '../../common/components/SimpleModal';

function ModalToCloneProject({ isOpen, onClose, currentAsset }) {
  const { t } = useTranslation('syllabus');

  const urlToClone = currentAsset?.url || currentAsset?.readme_url?.split('/blob')?.[0];
  const repoName = urlToClone?.split('/')?.pop();

  return (
    <SimpleModal
      maxWidth="xl"
      title={t('common:learnpack.clone-title')}
      isOpen={isOpen}
      onClose={onClose}
      headerStyles={{
        textAlign: 'center',
        textTransform: 'uppercase',
      }}
      bodyStyles={{
        className: 'markdown-body',
        padding: { base: '10px 30px' },
      }}
    >
      <MarkDownParser
        content={t('common:learnpack.cloneInstructions', {
          repoName,
          urlToClone,
          readmeUrl: currentAsset?.readme_url,
        }, { returnObjects: true })}
        showLineNumbers={false}
      />
    </SimpleModal>
  );
}

ModalToCloneProject.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  currentAsset: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};

ModalToCloneProject.defaultProps = {
  isOpen: false,
  onClose: () => {},
  currentAsset: null,
};

export default ModalToCloneProject;

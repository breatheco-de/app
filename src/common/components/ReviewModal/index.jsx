import PropTypes from 'prop-types';
import { useState } from 'react';
import { Box, Button, Flex, Link } from '@chakra-ui/react';
import SimpleModal from '../SimpleModal';
import Text from '../Text';
import useStyle from '../../hooks/useStyle';
import CodeReview from './CodeReview';
import AlertMessage from '../AlertMessage';
import Icon from '../Icon';
import FileList from './FileList';
import bc from '../../services/breathecode';
import { error } from '../../../utils/logging';

function ReviewModal({ isOpen, onClose, currentTask, projectLink, ...rest }) {
  const stages = {
    initial: 'initial',
    file_list: 'file_list',
    code_review: 'code_review',
  };
  const [selectedText, setSelectedText] = useState('');
  const [loaders, setLoaders] = useState({
    isFetchingCommitFiles: false,
  });
  const [contextData, setContextData] = useState({
    commitfiles: [],
    commitFile: {},
  });
  const [stage, setStage] = useState(stages.initial);
  const { lightColor, featuredColor, hexColor } = useStyle();
  // const [repoData, setRepoData] = useState({
  //   isFetching: true,
  // });
  const fullName = `${currentTask?.user?.first_name} ${currentTask?.user?.last_name}`;

  const handleSelectedText = () => {
    const text = window.getSelection().toString();
    if (text.length > 0) {
      setSelectedText(text);
    }
  };

  const widthSizes = {
    initial: '36rem',
    file_list: '42rem',
    code_review: '74rem',
  };

  const proceedToCommitFiles = () => {
    setLoaders((prevState) => ({
      ...prevState,
      isFetchingCommitFiles: true,
    }));
    bc.assignments().files(currentTask.id)
      .then((resp) => {
        setContextData((prevState) => ({
          ...prevState,
          commitfiles: {
            task: currentTask,
            fileList: resp.data,
          },
        }));
        setLoaders((prevState) => ({
          ...prevState,
          isFetchingCommitFiles: false,
        }));
        setStage(stages.file_list);
      }).catch((err) => {
        error('"proceedToCommitFiles" function error:', err);
      });
  };

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setStage(stages.initial);
      }}
      title={stage === stages.initial ? 'Assignment review' : 'Rigobot code review'}
      closeOnOverlayClick={false}
      maxWidth={widthSizes[stage]}
      isCentered={stage === stages.initial}
      // maxWidth="74rem"
      minHeight={stage === stages.initial ? 'auto' : '30rem'}
      bodyStyles={{
        display: 'flex',
        gridGap: '20px',
        padding: '1rem',
      }}
      headerStyles={{
        userSelect: 'none',
        textTransform: stage === stages.initial ? 'uppercase' : 'initial',
        fontSize: stage === stages.initial ? '15px' : '26px',
        textAlign: stage === stages.initial ? 'center' : 'start',
        fontWeight: 700,
      }}
      {...rest}
    >
      {stage === stages.initial && currentTask && (
        <Box maxWidth="500px" margin="0 auto">
          <AlertMessage type="warning" full message="This project needs to have at least 3 code reviews in order to be accepted or rejected." borderRadius="4px" padding="8px" mb="24px" />
          <Flex flexDirection="column" gridGap="16px">
            <Text size="14px" color={lightColor}>
              {`Student: ${fullName}`}
            </Text>
            <Text size="14px" color={lightColor}>
              <span>
                Project Instructions:
              </span>
              {' '}
              <Link variant="default" href={projectLink}>
                {currentTask?.title}
              </Link>
            </Text>
            <Flex padding="8px" flexDirection="column" gridGap="16px" background={featuredColor} borderRadius="4px">
              <Flex alignItems="center" gridGap="10px">
                <Icon icon="code" width="18.5px" height="17px" color="#fff" />
                <Text size="14px" fontWeight={700}>
                  0 code reviews
                </Text>
              </Flex>
              <Button height="auto" onClick={proceedToCommitFiles} variant="link" display="flex" alignItems="center" gridGap="10px" justifyContent="start">
                Start code review
                <Icon icon="longArrowRight" width="24px" height="10px" color={hexColor.blueDefault} />
              </Button>
            </Flex>
          </Flex>
        </Box>
      )}
      {stage === stages.file_list && !loaders.isFetchingCommitFiles && (
        <FileList data={contextData.commitfiles} setContextData={setContextData} stage={stage} stages={stages} setStage={setStage} />
      )}
      {stage === stages.code_review && contextData.commitFile?.code && (
        <CodeReview setStage={setStage} commitData={contextData.commitFile} selectedText={selectedText} handleSelectedText={handleSelectedText} />
      )}
    </SimpleModal>
  );
}

ReviewModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  currentTask: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  projectLink: PropTypes.string,
};
ReviewModal.defaultProps = {
  isOpen: false,
  onClose: () => {},
  currentTask: {},
  projectLink: '',
};

export default ReviewModal;

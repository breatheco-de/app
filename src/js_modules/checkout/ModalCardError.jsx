import Image from 'next/image';
import { Button, Flex, Text } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import SimpleModal from '../../common/components/SimpleModal';

function ModalCardError({
  openDeclinedModal, isSubmitting, setOpenDeclinedModal, declinedModalProps, handleTryAgain, disableTryAgain,
}) {
  const { t } = useTranslation('signup');

  return (
    <SimpleModal
      isOpen={openDeclinedModal}
      headerStyles={{
        padding: '0 0 16px 0',
        textAlign: 'center',
      }}
      maxWidth="510px"
      onClose={() => setOpenDeclinedModal(false)}
      title={declinedModalProps.title}
      padding="16px 0"
      gridGap="16px"
      bodyStyles={{
        display: 'flex',
        gridGap: '24px',
        padding: '1rem 1.5rem',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Image src="/static/images/avatar-for-transaction-failed.png" width={80} height={80} />

      <Text fontSize="18px" fontWeight="700" textAlign="center">
        {declinedModalProps.description}
      </Text>

      <Flex gridGap="24px">
        <Button variant="outline" onClick={() => setOpenDeclinedModal(false)} borderColor="blue.default" color="blue.default">
          {t('common:close')}
        </Button>
        {!disableTryAgain && (
          <Button
            isLoading={isSubmitting}
            variant="default"
            onClick={() => {
              handleTryAgain();
            }}
          >
            {t('common:try-again')}
          </Button>
        )}
      </Flex>
    </SimpleModal>
  );
}
ModalCardError.propTypes = {
  openDeclinedModal: PropTypes.bool,
  isSubmitting: PropTypes.bool.isRequired,
  setOpenDeclinedModal: PropTypes.func,
  declinedModalProps: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.any])),
  handleTryAgain: PropTypes.func,
  disableTryAgain: PropTypes.bool,
};

ModalCardError.defaultProps = {
  openDeclinedModal: false,
  setOpenDeclinedModal: () => {},
  handleTryAgain: () => {},
  declinedModalProps: {},
  disableTryAgain: false,
};

export default ModalCardError;

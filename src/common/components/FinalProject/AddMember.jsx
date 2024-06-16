/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-array-index-key */
import { useState } from 'react';
import { useField } from 'formik';
import PropTypes from 'prop-types';
import TagsInput from 'react-tagsinput';
import {
  Avatar,
  Box,
  Flex,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import AutosuggestInput from './Autosuggest';
import Icon from '../Icon';
import useStyle from '../../hooks/useStyle';
import useAuth from '../../hooks/useAuth';
import { isNumber } from '../../../utils';

function AddMember({ students, errors, required, hint }) {
  const [field, meta, helpers] = useField('members');
  const { featuredColor, disabledColor, lightColor } = useStyle();
  const { t } = useTranslation('final-project');
  const { user } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [warningModal, setWarningModal] = useState(false);
  const [removeKey, setRemoveKey] = useState(null);

  const handleAddTag = (tag) => {
    helpers?.setValue(tag);
  };

  const handleRemoveTag = (index) => {
    helpers?.remove(index);
  };

  const getTag = (tag) => {
    if (isNumber(tag)) {
      return `${tag}`;
    }
    if (tag?.match(/\(([^)]+)\)/) !== null) {
      return tag?.match(/\(([^)]+)\)/)[1];
    }
    return `${tag}`;
  };

  const isDisabled = students.filter((student) => student.user.id !== user.id).length === 0;

  return (
    <Box>
      <TagsInput
        className={`react-tagsinput ${errors?.members || isDisabled ? 'error' : ''}`}
        value={field.value.map((f) => f)}
        onChange={handleAddTag}
        onRemove={handleRemoveTag}
        renderInput={({ addTag, ref, onChange, value, ...props }) => (
          <AutosuggestInput
            ref={ref}
            value={value}
            addTag={addTag}
            students={students}
            handleChange={onChange}
            disabled={isDisabled}
            {...props}
            placeholder={`${t('modal-form.add-participants')}${required ? '*' : ''}`}
            className={`${props.className} ${errors?.members ? 'error' : ''}`}
          />
        )}
        renderTag={({ tag, key, onRemove }) => {
          const tagId = getTag(tag);
          const replaceTag = typeof tagId === 'string' ? tagId?.replace(/\(([^)]+)\)/, '')?.trim() : tagId;
          const userData = students?.find((student) => student?.user?.id === Number(tagId));

          return (
            <Box as="span" fontSize="15px" fontWeight={400} background={featuredColor} color={disabledColor} key={key} className="react-tagsinput-tag">
              {userData && (
                <Avatar
                  id={`(${userData?.user?.id}) ${userData?.user?.full_name}`}
                  width="25px"
                  height="25px"
                  style={{ userSelect: 'none' }}
                  marginRight="5px"
                  src={userData?.user?.profile?.avatar_url || userData?.user?.github?.avatar_url}
                />
              )}
              {userData?.user?.id ? userData?.user?.full_name : replaceTag}
              <Box
                as="button"
                marginStart="5px"
                verticalAlign="text-bottom"
                type="button"
                className="react-tagsinput-remove"
                onClick={(e) => {
                  e.preventDefault();

                  const regExp = /\(([^)]+)\)/;
                  const members = field.value.map((val) => {
                    if (typeof val === 'string') return parseInt(regExp.exec(val)[1], 10);
                    return val;
                  });

                  if (members.length === 1 && members.includes(user.id)) return setWarningModal(true);
                  if (user.id === userData?.user?.id) {
                    setOpenModal(true);
                    return setRemoveKey(key);
                  }
                  return onRemove(key);
                }}
              >
                <Icon icon="closeRounded" width="15px" height="15px" color="#999" />
              </Box>
              <Modal isOpen={openModal} onClose={() => setOpenModal(false)}>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>{t('modal-form.confirmation.title')}</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    {t('modal-form.confirmation.text')}
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      colorScheme="blue"
                      mr={3}
                      onClick={() => {
                        onRemove(removeKey);
                        setRemoveKey(null);
                        setOpenModal(false);
                      }}
                    >
                      {t('modal-form.confirmation.confirm')}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setOpenModal(false)}
                    >
                      {t('modal-form.confirmation.cancel')}
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>

              {/* Warning modal */}
              <Modal isOpen={warningModal} onClose={() => setWarningModal(false)}>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader marginTop="15px">{t('modal-form.warning-modal.title')}</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    {/* {t('modal-form.confirmation.text')} */}
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      variant="default"
                      mr={3}
                      onClick={() => {
                        setWarningModal(false);
                      }}
                    >
                      {t('modal-form.warning-modal.close')}
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </Box>
          );
        }}
      />
      {hint && !errors?.members && !isDisabled && (
        <Box fontSize="sm" color={lightColor} mt={2}>{hint}</Box>
      )}
      {errors?.members && <Box className="error-message">{errors?.members}</Box>}
      {isDisabled && <Box className="error-message">{t('modal-form.no-students')}</Box>}
    </Box>
  );
}

AddMember.propTypes = {
  errors: PropTypes.shape({
    members: PropTypes.string,
  }),
  students: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  required: PropTypes.bool,
  hint: PropTypes.string,
};

AddMember.defaultProps = {
  errors: {},
  required: false,
  hint: '',
};

export default AddMember;

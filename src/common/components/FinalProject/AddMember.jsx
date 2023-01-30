/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-array-index-key */
import { useField } from 'formik';
import PropTypes from 'prop-types';
import TagsInput from 'react-tagsinput';
import { Avatar, Box, Flex } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import AutosuggestInput from './Autosuggest';
import Icon from '../Icon';
import useStyle from '../../hooks/useStyle';
import { isNumber } from '../../../utils';

const AddMember = ({ translation, students, errors, required, hint }) => {
  const [field, meta, helpers] = useField('members');
  const { featuredColor, disabledColor, lightColor } = useStyle();
  const { t } = useTranslation('final-project');

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

  return (
    <Box>
      <TagsInput
        className={`react-tagsinput ${errors?.members ? 'error' : ''}`}
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
            {...props}
            placeholder={`${translation?.finalProjectTranslation?.['modal-form']?.['add-participants'] || t('modal-form.add-participants')}${required ? '*' : ''}`}
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
                  onRemove(key);
                }}
              >
                <Icon icon="closeRounded" width="15px" height="15px" color="#999" />
              </Box>
            </Box>
          );
        }}
      />
      {hint && !errors?.members && (
        <Box fontSize="sm" color={lightColor} mt={2}>{hint}</Box>
      )}
      {errors?.members && <Box className="error-message">{errors?.members}</Box>}
    </Box>
  );
};

AddMember.propTypes = {
  errors: PropTypes.shape({
    members: PropTypes.string,
  }),
  students: PropTypes.arrayOf(PropTypes.object).isRequired,
  translation: PropTypes.objectOf(PropTypes.any),
  required: PropTypes.bool,
  hint: PropTypes.string,
};

AddMember.defaultProps = {
  errors: {},
  translation: {},
  required: false,
  hint: '',
};

export default AddMember;

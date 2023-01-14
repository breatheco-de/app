/* eslint-disable no-unused-vars */
/* eslint-disable react/no-array-index-key */
import { useField } from 'formik';
import PropTypes from 'prop-types';
import { useState } from 'react';
import TagsInput from 'react-tagsinput';
import { Box } from '@chakra-ui/react';
import AutosuggestInput from './Autosuggest';

const AddMember = ({ students, errors }) => {
  const [field, meta, helpers] = useField('geeks_members');
  const [openList, setOpenList] = useState(false);

  console.log('students:::', students);
  const handleAddTag = (tag) => {
    // receives the tag value string
    console.log('tag:::', tag);
    helpers?.setValue(tag);
  };

  const handleRemoveTag = (index) => {
    helpers?.remove(index);
  };
  // const handleKeyPress = (event) => {
  //   if (event.key === 'Enter') {
  //     setMembers([...tags, event.target.value]);
  //     event.target.value = '';
  //   }
  // };
  // const handleChange = (event) => {
  //   setMembers(event.target.value.split(','));
  // };

  return (
    <Box>
      <div htmlFor="members">Friends:</div>
      {/* <TagsInput value={members} onChange={handleAddTag} onRemove={handleRemoveTag} /> */}
      <TagsInput
        value={field.value.map((f) => f)}
        onChange={handleAddTag}
        onRemove={handleRemoveTag}
        renderInput={({ addTag, onChange, value, ...props }) => (
          <AutosuggestInput value={value} addTag={addTag} handleChange={onChange} {...props} />
          // <input
          //   value={value}
          //   width="100%"
          //   onChange={(e) => {
          //     if (e.target.value?.length > 2) {
          //       setOpenList(true);
          //     }

          //     onChange(e);
          //   }}
          //   {...props}
          //   placeholder="Add a member"
          // />
        )}
        renderTag={({ tag, key, onRemove }) => (
          <span key={key} className="react-tagsinput-tag">
            {tag}
            <button
              type="button"
              className="react-tagsinput-remove"
              onClick={(e) => {
                e.preventDefault();
                onRemove(key);
              }}
            >
              x
            </button>
          </span>
        )}
        options={students}
      />
      {/* renderInput={({ addTag, onChange, value, ...props }) => (
        <input
          value={value}
          width="100%"
          onChange={(e) => {
            if (e.target.value?.length > 2) {
              setOpenList(true);
            }

            onChange(e);
          }}
          {...props}
          placeholder="Add a member"
        />
      )} */}
      {errors?.geeks_members ? <div>{errors?.geeks_members}</div> : null}
    </Box>
  );
};

AddMember.propTypes = {
  errors: PropTypes.shape({
    geeks_members: PropTypes.string,
  }),
  students: PropTypes.arrayOf(PropTypes.object).isRequired,
};

AddMember.defaultProps = {
  errors: {},
};

export default AddMember;

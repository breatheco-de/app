/* eslint-disable react/no-array-index-key */
// import { Input } from '@chakra-ui/react';
import { useField } from 'formik';
// import { useEffect, useState } from 'react';
import TagsInput from 'react-tagsinput';

const AddMember = () => {
  const [field, meta, helpers] = useField('geeks_members');

  // const handleAddTag = (tag) => {
  //   setMembers([...members, tag]);
  //   helpers.setValue(members);
  // };
  // const handleRemoveTag = (index) => {
  //   setMembers(members.filter((f, i) => i !== index));
  //   helpers.setValue(members);
  // };

  // TODO: fix this
  console.log('helpers:::', helpers);
  console.log('field:::', field);
  console.log('meta:::', meta);
  const handleAddTag = (tag) => {
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
    <div>
      <div htmlFor="members">Friends:</div>
      {/* <TagsInput value={members} onChange={handleAddTag} onRemove={handleRemoveTag} /> */}
      <TagsInput value={field.value.map((f) => f)} onChange={handleAddTag} onRemove={handleRemoveTag} />
      {meta.error && meta.touched ? <div>{meta.error}</div> : null}
    </div>
  );
};

export default AddMember;

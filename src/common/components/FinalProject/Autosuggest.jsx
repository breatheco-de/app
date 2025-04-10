/* eslint-disable no-param-reassign */
import { forwardRef, useState } from 'react';
import Autosuggest from 'react-autosuggest';
import PropTypes from 'prop-types';
import { Avatar, Box } from '@chakra-ui/react';
import useStyle from '../../../hooks/useStyle';

const filterInputValue = (students, inputLength, inputValue) => students.filter(
  (student) => `${student?.user?.full_name}`.toLowerCase().slice(0, inputLength) === inputValue,
);

const getSuggestions = (value, students) => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue?.length;

  return filterInputValue(students, inputLength, inputValue);
};

const AutosuggestInput = forwardRef(({ handleChange, placeholder, addTag, students, value: externalValue, ...props }, ref) => {
  const [suggestions, setSuggestions] = useState([]);
  const { fontColor } = useStyle();

  const renderSuggestion = (suggestion) => (
    <Box color={fontColor} display="flex" gridGap="8px">
      <Avatar
        id={`(${suggestion?.user?.id}) ${suggestion?.user?.full_name}`}
        width="25px"
        height="25px"
        style={{ userSelect: 'none' }}
        src={suggestion?.user?.profile?.avatar_url || suggestion?.user?.github?.avatar_url}
      />
      {`(${suggestion?.user?.id}) ${suggestion.user.full_name}`}
    </Box>
  );

  const onChange = (event, { newValue }) => {
    event.target.value = newValue || event.target.outerText;
    handleChange(event);
  };

  const onSuggestionSelected = (event) => {
    handleChange(event);
    addTag(event.target.value);
  };

  const getSuggestionValue = (student) => `(${student?.user?.id}) ${student?.user?.full_name}`;

  return (
    <Autosuggest
      suggestions={suggestions}
      // alwaysRenderSuggestions // show suggestions on focus when input is empty
      onSuggestionsFetchRequested={({ value }) => setSuggestions(getSuggestions(value, students))}
      onSuggestionSelected={onSuggestionSelected}
      onSuggestionsClearRequested={() => setSuggestions([])}
      getSuggestionValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      inputProps={{
        ref,
        value: externalValue,
        onChange,
        ...props,
        placeholder,
      }}
    />
  );
});

AutosuggestInput.propTypes = {
  props: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  handleChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  addTag: PropTypes.func.isRequired,
  ref: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  students: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  placeholder: PropTypes.string,
};
AutosuggestInput.defaultProps = {
  props: {},
  placeholder: 'Add member',
};

export default AutosuggestInput;

/* eslint-disable no-param-reassign */
import { forwardRef, useState } from 'react';
import Autosuggest from 'react-autosuggest';
import PropTypes from 'prop-types';

const getSuggestions = (value, students) => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue?.length;
  return inputLength === 0 ? [] : students.filter(
    (student) => `${student?.user?.full_name}`.toLowerCase().slice(0, inputLength) === inputValue,
  );
};

const AutosuggestInput = forwardRef(({ handleChange, addTag, value: externalValue, ...props }, ref) => {
  const [suggestions, setSuggestions] = useState([]);

  const students = [
    {
      user: {
        full_name: 'John Doe',
      },
    },
    {
      user: {
        full_name: 'Jane Doe',
      },
    },
    {
      user: {
        full_name: 'John Smith',
      },
    },
  ];

  const renderSuggestion = (suggestion) => (
    <span color="#000">{suggestion.user.full_name}</span>
  );

  const onChange = (event, { newValue }) => {
    event.target.value = newValue || event.target.outerText;
    handleChange(event);
  };

  const onSuggestionSelected = (event) => {
    handleChange(event);
    addTag(event.target.value);
  };

  const getSuggestionValue = (student) => `${student?.user?.full_name}`;

  return (
    <Autosuggest
      suggestions={suggestions}
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
        placeholder: 'Add member',
      }}
    />
  );
});

AutosuggestInput.propTypes = {
  props: PropTypes.objectOf(PropTypes.any),
  handleChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  addTag: PropTypes.func.isRequired,
  ref: PropTypes.objectOf(PropTypes.any).isRequired,
};
AutosuggestInput.defaultProps = {
  props: {},
};

export default AutosuggestInput;

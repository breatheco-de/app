/* eslint-disable jsx-a11y/role-has-required-aria-props */
/* eslint-disable no-unused-vars */
/* eslint-disable array-callback-return */
/* eslint-disable no-unused-expressions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/interactive-supports-focus */
import React, { useState, useRef } from 'react';
import InputMask from 'react-input-mask';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Box, FormControl, FormErrorMessage } from '@chakra-ui/react';
import { Field } from 'formik';
import countriesList from './countriesList.json';
// import { Colors } from '../../Styling';

function PhoneInput({
  defaultMask,
  phoneFormValues,
  prefix,
  containerStyle,
  required,
  formData,
  style,
  inputStyle,
  buttonStyle,
  dropdownStyle,
  setVal,
  enableSearch,
  searchClass,
  disableSearchIcon,
  searchStyle,
  id,
  searchPlaceholder,
  autocompleteSearch,
  searchNotFound,
  sessionContextLocation,
  campusDial,
  setShowPhoneWarning,
  errorMsg,
  placeholder,
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState({
    name: 'United States',
    locations: ['downtown-miami'],
    iso2: 'us',
    countryCode: '1',
    dialCode: '1',
  });
  const dropdownMenuRef = useRef();
  const [validStatus, setValidStatus] = useState({ valid: true });
  const regex = {
    phone: /^(?!(\d{2,})\1+)(?!(\d+)\2{3,})(\+\d{1,3})?(\d{8,10})$/,
  };
  const highlightCountryIndex = 0;

  const getCountryPhoneMask = () => {
    const getMask = countriesList.find(
      (mask) => mask.iso === selectedCountry?.iso2?.toUpperCase(),
    );
    const mask = getMask ? `+${selectedCountry.dialCode} ${getMask.mask}` : `+${selectedCountry.dialCode} 9999 9999 9999`;
    return mask;
  };

  const initializedCountries = countriesList.map((country) => {
    const countryItem = {
      name: country.name,
      locations: country.locations,
      iso2: country?.iso?.toLocaleLowerCase(),
      countryCode: country.code,
      dialCode: country.code,
      priority: country?.priority || 0,
    };
    return countryItem;
  });

  const getLocationCoincidence = (country, sessionLocation) => {
    if (country.name === sessionLocation.country || country.name === sessionLocation.name) {
      return setSelectedCountry(country);
    }
    if (
      country.locations.some(
        (loc) => loc === sessionLocation.active_campaign_location_slug,
      )
    ) { return setSelectedCountry(country); }
    return false;
  };

  React.useEffect(() => {
    if (sessionContextLocation !== null && sessionContextLocation) {
      initializedCountries.find((country) => getLocationCoincidence(country, sessionContextLocation));
    }
  }, [sessionContextLocation]);

  React.useEffect(() => {
    const prefixCode = prefix + selectedCountry.dialCode;
    setPhoneNumber(prefixCode);
  }, [selectedCountry]);

  React.useEffect(() => {
    if (
      setShowPhoneWarning
      && campusDial
      && campusDial !== ''
      && campusDial.dialCode !== selectedCountry.dialCode
    ) { setShowPhoneWarning(true); } else if (setShowPhoneWarning) setShowPhoneWarning(false);
  }, [campusDial, selectedCountry]);

  const handleSearchChange = (e) => {
    const {
      // eslint-disable-next-line no-shadow
      currentTarget: { value: searchValue },
    } = e;
    setSearchValue(searchValue);
  };

  React.useEffect(() => {
    const checkIfClickedOutside = (e) => {
      // If the menu is open and the clicked target is not within the menu,
      // then close the menu
      if (
        showDropdown
        && dropdownMenuRef.current
        && !dropdownMenuRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', checkIfClickedOutside);
    return () => {
      // Cleanup the event listener
      document.removeEventListener('mousedown', checkIfClickedOutside);
    };
  }, [showDropdown]);

  const handleFlagDropdownClick = (e) => {
    e.preventDefault();
    setShowDropdown(!showDropdown);
  };

  const getSearchFilteredCountries = () => {
    const allCountries = initializedCountries;

    const sanitizedSearchValue = searchValue.trim().toLowerCase();
    if (enableSearch && sanitizedSearchValue) {
      // [...new Set()] to get rid of duplicates
      // firstly search by iso2 code
      if (/^\d+$/.test(sanitizedSearchValue)) {
        // contains digits only
        // values wrapped in ${} to prevent undefined
        return allCountries.filter(({ dialCode }) => [`${dialCode}`].some((field) => field.toLowerCase().includes(sanitizedSearchValue)));
      }
      const iso2countries = allCountries.filter(({ iso2 }) => [`${iso2}`].some((field) => field.toLowerCase().includes(sanitizedSearchValue)));

      const searchedCountries = allCountries.filter(
        ({ name, localName, iso2 }) => [`${name}`, `${localName || ''}`].some((field) => field.toLowerCase().includes(sanitizedSearchValue)),
      );
      return [...new Set([].concat(iso2countries, searchedCountries))];
    }
    return allCountries;
  };

  const handleFlagItemClick = (country, e) => {
    e.preventDefault();
    setSelectedCountry(country);
    setShowDropdown(false);
  };

  const handlePhoneInput = (e) => {
    let isValid = true;
    const prefixCode = prefix + selectedCountry.dialCode;

    // Gets the character of the formatted phone number
    const formatOfCharacters = e.target.value.match(/[^A-Za-z0-9 ]/g);
    const prefixLength = selectedCountry.isAreaCode
      ? prefixCode.length + formatOfCharacters.length
      : prefixCode.length;

    // remove the prefix and characters of the formated country from the target input
    const input = e.target.value.substr(prefixLength);
    setPhoneNumber(prefixCode + input);

    const cleanedPhoneInput = `+${(prefixCode + input).match(/\d+/g).join('')}`;

    isValid = required === false ? true : regex.phone.test(cleanedPhoneInput);
    if (isValid !== validStatus) {
      setValidStatus({
        valid: isValid,
        msg: isValid ? 'Ok' : errorMsg,
      });
    }
    setVal({
      ...formData,
      // phone: { ...phoneFormValues, value: cleanedPhoneInput, valid: true },
      phone: cleanedPhoneInput,
    });
  };

  const searchedCountries = getSearchFilteredCountries();

  const countryDropdownList = searchedCountries.map((country, index) => {
    const currIndex = index;
    const highlight = highlightCountryIndex === index;
    return (
      <li
        key={`flag_no_${currIndex}`}
        data-flag-key={`flag_no_${currIndex}`}
        className={`country ${highlight ? 'highlight' : ''}`}
        data-dial-code="1"
        tabIndex="-1"
        data-country-code={country.iso2}
        onClick={(e) => handleFlagItemClick(country, e)}
        role="option"
        {...(highlight ? { 'aria-selected': true } : {})}
      >
        <div className={`flag ${country.iso2}`} />
        <span className="country-name">
          {country.localName || country.name}
        </span>
        <span className="dial-code">{prefix + country.dialCode}</span>
      </li>
    );
  });

  return (
    <Box className="react-tel-input" color="black" style={style || containerStyle}>
      <Field name="phone">
        {({ field, form }) => (
          <FormControl style={style} isInvalid={form.errors.phone && form.touched.phone}>
            <InputMask
              {...field}
              data-cy="phone"
              className={`form-control ${!validStatus.valid ? 'invalid' : ''}`}
              style={inputStyle}
              placeholder={placeholder}
              onChange={(e) => {
                const cleanedPhoneInput = `+${(e.target.value)?.match(/\d+/g)?.join('')}`;
                e.target.value = cleanedPhoneInput || e.target.value;

                handlePhoneInput(e);
                field.onChange(e);
              }}
              value={phoneNumber}
              type="phone"
              id={id || 'phone'}
              // mask="+1\(999) 999-9999"/
              mask={getCountryPhoneMask()}
              maskChar=""
              // formatChars={{
              //   "9": "[0-9]",
              //   "a": "[A-Za-z]",
              //   "*": "[A-Za-z0-9]"
              // }}
            />
            <FormErrorMessage>{form.errors.phone}</FormErrorMessage>
          </FormControl>
        )}
      </Field>

      <div
        ref={dropdownMenuRef}
        className={`flag-dropdown ${showDropdown ? 'open' : ''} ${
          !validStatus.valid ? 'invalid' : ''
        }`}
        style={buttonStyle}
      >
        <div
          onClick={(e) => handleFlagDropdownClick(e)}
          className={`selected-flag ${showDropdown ? 'open' : ''}`}
          title={
            selectedCountry
              ? `${selectedCountry.name}: + ${selectedCountry.dialCode}`
              : ''
          }
          role="button"
          aria-haspopup="listbox"
          aria-expanded={showDropdown ? true : undefined}
        >
          <div className={`flag ${selectedCountry.iso2}`}>
            <div className={`arrow ${showDropdown ? 'up' : ''}`} />
          </div>
        </div>
        {showDropdown && (
          <ul
            className={`country-list ${showDropdown ? 'hide' : ''}`}
            style={dropdownStyle}
            role="listbox"
            tabIndex="0"
          >
            {enableSearch && (
              <li className={`search ${searchClass}`}>
                {!disableSearchIcon && (
                  <span
                    className={`search-emoji ${
                      searchClass ? `${searchClass}-emoji` : ''
                    }`}
                    role="img"
                    aria-label="Magnifying glass"
                  >
                    &#128270;
                  </span>
                )}
                <input
                  className={`search-box ${
                    searchClass ? `${searchClass}-box` : ''
                  }`}
                  style={searchStyle}
                  type="search"
                  placeholder={searchPlaceholder}
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                  autoComplete={autocompleteSearch ? 'on' : 'off'}
                  value={searchValue}
                  onChange={(e) => handleSearchChange(e)}
                />
              </li>
            )}
            {countryDropdownList.length > 0 ? (
              countryDropdownList
            ) : (
              <li className="no-entries-message">
                <span>{searchNotFound}</span>
              </li>
            )}
          </ul>
        )}
      </div>
    </Box>
  );
}

PhoneInput.propTypes = {
  defaultMask: PropTypes.string,
  phoneFormValues: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  prefix: PropTypes.string,
  containerStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  formData: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  style: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  inputStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  buttonStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  dropdownStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  searchStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  setVal: PropTypes.func,
  enableSearch: PropTypes.bool,
  searchClass: PropTypes.string,
  disableSearchIcon: PropTypes.bool,
  id: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  autocompleteSearch: PropTypes.bool,
  searchNotFound: PropTypes.string,
  sessionContextLocation: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  campusDial: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  setShowPhoneWarning: PropTypes.func,
  errorMsg: PropTypes.string,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
};
PhoneInput.defaultProps = {
  defaultMask: '',
  phoneFormValues: {},
  prefix: '+',
  containerStyle: {},
  formData: {},
  style: {},
  inputStyle: {},
  buttonStyle: {},
  dropdownStyle: {},
  searchStyle: {},
  setVal: () => {},
  enableSearch: true,
  searchClass: '',
  disableSearchIcon: false,
  id: '',
  searchPlaceholder: 'Search',
  autocompleteSearch: false,
  searchNotFound: 'No entries to show',
  sessionContextLocation: {},
  campusDial: {},
  setShowPhoneWarning: () => {},
  errorMsg: 'Please specify a valid phone number',
  placeholder: 'Phone',
  required: true,
};

export default PhoneInput;

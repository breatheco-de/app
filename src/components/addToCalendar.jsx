import React, { useRef } from 'react';
import { Box, Button, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useAddToCalendar, { handleCalendarClick } from '../hooks/useAddToCalendar';
import Text from './Text';

function AddToCalendar({ event, buttonLabel, buttonProps, ...rest }) {
  const calendarOptions = useAddToCalendar(event);
  const buttonRef = useRef();

  return (
    <Box {...rest}>
      <Menu isLazy>
        <MenuButton as={Button} ref={buttonRef} {...buttonProps}>
          <Text>{buttonLabel}</Text>
        </MenuButton>
        <MenuList>
          {calendarOptions.map((option) => (
            <MenuItem
              as="a"
              href={option.url}
              key={option.key}
              onClick={(e) => {
                e.preventDefault();
                handleCalendarClick(option.url);
              }}
            >
              <Text>{option.label}</Text>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Box>
  );
}

AddToCalendar.propTypes = {
  event: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    startTime: PropTypes.string.isRequired,
    endTime: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
  }).isRequired,
  buttonLabel: PropTypes.string,
  buttonProps: PropTypes.objectOf(PropTypes.string),
};

AddToCalendar.defaultProps = {
  buttonLabel: '',
  buttonProps: {},
};

export default AddToCalendar;

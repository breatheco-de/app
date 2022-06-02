import { memo } from 'react';
import {
  WrapItem,
  Avatar,
  Tooltip,
  // AvatarBadge,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';

const AvatarUser = ({ data, fullName }) => {
  const { user } = data;
  const fullNameLabel = fullName || `${user.first_name} ${user.last_name}`;
  return (
    <Tooltip key={fullNameLabel} label={fullNameLabel} placement="top">
      <WrapItem justifyContent="center" alignItems="center">
        <Avatar
          id={fullNameLabel}
          width="39px"
          height="39px"
          style={{ userSelect: 'none' }}
          src={user.profile?.avatar_url}
        >
          {/*
          //ONLINE/OFFLINE BADGE icon
          <AvatarBadge
            boxSize="9px"
            bg={user?.active ? 'success' : 'danger'}
            top="0"
            border="1px solid"
          /> */}
        </Avatar>
      </WrapItem>
    </Tooltip>
  );
};

AvatarUser.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  fullName: PropTypes.string,
};
AvatarUser.defaultProps = {
  fullName: '',
};

export default memo(AvatarUser);

import { memo } from 'react';
import {
  WrapItem,
  Avatar,
  AvatarBadge,
  Tooltip,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';

const AvatarUser = ({ data }) => {
  const { user } = data;
  const fullName = `${user.first_name} ${user.last_name}`;
  return (
    <Tooltip key={fullName} label={fullName} placement="top">
      <WrapItem justifyContent="center" alignItems="center">
        <Avatar
          width="39px"
          height="39px"
          name={fullName}
          src={user?.image}
        >
          <AvatarBadge
            boxSize="9px"
            bg={user?.active ? 'success' : 'danger'}
            top="0"
            border="1px solid"
          />
        </Avatar>
      </WrapItem>
    </Tooltip>
  );
};

AvatarUser.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default memo(AvatarUser);

import { memo } from 'react';
import {
  WrapItem,
  Avatar,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverArrow,
  PopoverBody,
  Box,
  useMediaQuery,
  // AvatarBadge,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import Heading from '../../common/components/Heading';
import Text from '../../common/components/Text';

const AvatarUser = ({
  data, fullName, containerStyle, width, height, badge,
}) => {
  const { user } = data;
  const { t } = useTranslation('dashboard');
  const fullNameLabel = fullName || `${user.first_name} ${user.last_name}`;
  const router = useRouter();

  const [isBelowTablet] = useMediaQuery('(max-width: 768px)');
  const dateFormated = {
    en: data?.created_at && format(new Date(data?.created_at), 'MMMM dd, yyyy'),
    es: data?.created_at && format(new Date(data?.created_at), "dd 'de' MMMM, yyyy", { locale: es }),
  };

  const roles = {
    teacher: t('common:teacher'),
    assistant: t('common:assistant'),
    student: t('common:student'),
  };
  const infoText = {
    en: `${roles[data?.role?.toLowerCase()] || 'member'} in this cohort since`,
    es: `${roles[data?.role?.toLowerCase()] || 'member'} en esta cohorte desde`,
  };
  const placementCard = isBelowTablet ? 'auto' : 'left-end';

  return (
    <Popover trigger="hover" key={fullNameLabel} placement={placementCard}>
      <PopoverTrigger>
        <WrapItem as="div" justifyContent="center" alignItems="center" style={containerStyle}>
          <Avatar
            id={fullNameLabel}
            width={width}
            height={height}
            style={{ userSelect: 'none' }}
            src={user.profile?.avatar_url}
          >
            {badge && (badge)}
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
      </PopoverTrigger>
      <PopoverContent>
        {data?.role && (
          <PopoverHeader>
            <Heading
              size="15px"
              fontWeight="semibold"
              textTransform="uppercase"
              py="4px"
              px="8px"
              dangerouslySetInnerHTML={{
                __html: `${roles[data?.role?.toLowerCase()] || 'member'}`,
              }}
            />
          </PopoverHeader>
        )}
        <PopoverArrow />
        <PopoverBody display="flex" flexDirection="row" gridGap="15px" my="8px">
          <Avatar
            id={fullNameLabel}
            width="95px"
            height="95px"
            style={{ userSelect: 'none' }}
            src={user.profile?.avatar_url}
          />
          <Box display="flex" flexDirection="column" justifyContent="center" gridGap="10px" height="auto">
            <Heading size="15px">
              {fullNameLabel}
            </Heading>
            <Text size="sm" fontWeight="400">
              {`${infoText[router.locale]} ${dateFormated[router.locale]}`}
            </Text>

          </Box>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

AvatarUser.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  fullName: PropTypes.string,
  containerStyle: PropTypes.objectOf(PropTypes.any),
  width: PropTypes.string,
  height: PropTypes.string,
  badge: PropTypes.elementType,
};
AvatarUser.defaultProps = {
  fullName: '',
  containerStyle: {},
  width: '39px',
  height: '39px',
  badge: null,
};

export default memo(AvatarUser);
